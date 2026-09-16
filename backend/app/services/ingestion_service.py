import io
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, Tuple, Optional, List
import polars as pl
from fastapi import HTTPException, status

from app.config import PROCESSED_DATA_DIR, RAW_DATA_DIR
from app.schemas.ingestion import (
    RecordType,
    REQUIRED_COLUMNS,
    IngestionResponse,
    DatasetStatus,
    DatasetRowPreview,
    DatasetPreviewResponse,
)
from app.services.hash_service import compute_sha256
from app.db.audit_store import log_audit_event, get_latest_valid_hash, clear_audit_logs
from app.db.decision_store import clear_all_decisions


class IngestionService:

    @staticmethod
    def validate_and_parse(
        file_bytes: bytes,
        filename: str,
        record_type: RecordType
    ) -> Tuple[pl.DataFrame, List[str]]:
        """
        Parses raw bytes using Polars and strictly validates presence of required columns.
        Raises HTTPException(400) if required columns are missing.
        """
        if len(file_bytes) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Uploaded file '{filename}' is empty."
            )

        # Parse via Polars
        try:
            if filename.lower().endswith(".parquet"):
                df = pl.read_parquet(io.BytesIO(file_bytes))
            elif filename.lower().endswith(".csv") or filename.lower().endswith(".txt"):
                df = pl.read_csv(
                    io.BytesIO(file_bytes),
                    infer_schema_length=10000,
                    ignore_errors=False,
                    truncate_ragged_lines=False
                )
            else:
                # Try CSV parsing first, fallback to parquet if failed
                try:
                    df = pl.read_csv(io.BytesIO(file_bytes), infer_schema_length=10000)
                except Exception:
                    df = pl.read_parquet(io.BytesIO(file_bytes))
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to parse file '{filename}' with Polars: {str(e)}"
            )

        if df.is_empty():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File '{filename}' contains 0 rows."
            )

        # Normalize column names to lowercase and stripped
        df = df.rename({c: c.strip().lower() for c in df.columns})
        present_cols = df.columns
        required_cols = REQUIRED_COLUMNS[record_type]

        missing_cols = [col for col in required_cols if col not in present_cols]
        if missing_cols:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": "Validation failed: Missing required columns",
                    "record_type": record_type.value,
                    "missing_columns": missing_cols,
                    "present_columns": present_cols,
                    "required_columns": required_cols,
                    "message": f"Required column(s) {missing_cols} not found in {filename}."
                }
            )

        # Type casting and sanity checks
        try:
            if record_type == RecordType.OMR:
                df = df.with_columns([
                    pl.col("candidate_id").cast(pl.Utf8),
                    pl.col("centre_id").cast(pl.Utf8),
                    pl.col("room_id").cast(pl.Utf8),
                    pl.col("seat_number").cast(pl.Int64),
                    pl.col("question_id").cast(pl.Utf8),
                    pl.col("selected_option").cast(pl.Utf8),
                    pl.col("raw_score").cast(pl.Float64),
                ])
            elif record_type == RecordType.SERVER:
                df = df.with_columns([
                    pl.col("candidate_id").cast(pl.Utf8),
                    pl.col("final_score").cast(pl.Float64),
                    pl.col("server_timestamp").cast(pl.Utf8),
                ])
            elif record_type == RecordType.SEATING:
                df = df.with_columns([
                    pl.col("candidate_id").cast(pl.Utf8),
                    pl.col("centre_id").cast(pl.Utf8),
                    pl.col("room_id").cast(pl.Utf8),
                    pl.col("seat_number").cast(pl.Int64),
                ])
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Column type conversion error for '{record_type.value}': {str(e)}"
            )

        return df, present_cols

    @staticmethod
    def process_ingestion(
        file_bytes: bytes,
        filename: str,
        record_type: RecordType,
        uploader_identity: str = "investigator_admin",
        is_synthetic: bool = False
    ) -> IngestionResponse:
        """
        Executes end-to-end ingestion:
        1. Calculates SHA-256 hash
        2. Validates schema using Polars
        3. Appends audit log (append-only)
        4. Saves verified dataset into processed storage (Parquet)
        """
        timestamp = datetime.now(timezone.utc).isoformat()
        file_hash = compute_sha256(file_bytes)
        file_size = len(file_bytes)

        try:
            df, present_cols = IngestionService.validate_and_parse(
                file_bytes=file_bytes,
                filename=filename,
                record_type=record_type
            )
            row_count = df.height

            # Save processed dataset as Parquet for zero-copy memory-mapped access
            output_file = PROCESSED_DATA_DIR / f"{record_type.value}.parquet"
            # Add metadata columns if needed
            df_to_save = df.with_columns([
                pl.lit(is_synthetic).alias("is_synthetic"),
                pl.lit(file_hash).alias("source_sha256"),
                pl.lit(timestamp).alias("ingested_at")
            ])
            df_to_save.write_parquet(output_file, compression="zstd")

            # Save raw copy if needed for audit verification
            raw_copy = RAW_DATA_DIR / f"{record_type.value}_{file_hash[:12]}_{filename}"
            with open(raw_copy, "wb") as f:
                f.write(file_bytes)

            # Log SUCCESS to append-only audit table
            details_json = json.dumps({
                "columns": present_cols,
                "row_count": row_count,
                "output_parquet": str(output_file.name)
            })
            log_audit_event(
                record_type=record_type.value,
                filename=filename,
                file_hash=file_hash,
                file_size_bytes=file_size,
                row_count=row_count,
                uploader_identity=uploader_identity,
                is_synthetic=is_synthetic,
                status="SUCCESS",
                details=details_json,
                timestamp=timestamp
            )

            return IngestionResponse(
                success=True,
                record_type=record_type,
                filename=filename,
                file_hash_sha256=file_hash,
                row_count=row_count,
                columns_found=present_cols,
                is_synthetic=is_synthetic,
                uploader_identity=uploader_identity,
                timestamp=timestamp,
                message=f"Successfully ingested and cryptographically verified {row_count:,} rows for {record_type.value.upper()}."
            )

        except HTTPException as he:
            # Log VALIDATION_ERROR to append-only audit table
            err_details = json.dumps({"error": he.detail})
            log_audit_event(
                record_type=record_type.value,
                filename=filename,
                file_hash=file_hash,
                file_size_bytes=file_size,
                row_count=0,
                uploader_identity=uploader_identity,
                is_synthetic=is_synthetic,
                status="VALIDATION_ERROR",
                details=err_details,
                timestamp=timestamp
            )
            raise he
        except Exception as e:
            err_details = json.dumps({"error": str(e)})
            log_audit_event(
                record_type=record_type.value,
                filename=filename,
                file_hash=file_hash,
                file_size_bytes=file_size,
                row_count=0,
                uploader_identity=uploader_identity,
                is_synthetic=is_synthetic,
                status="SYSTEM_ERROR",
                details=err_details,
                timestamp=timestamp
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Internal ingestion processing error: {str(e)}"
            )

    @staticmethod
    def get_datasets_status() -> Dict[str, DatasetStatus]:
        """
        Returns the current ingestion and cryptographic verification status of all 3 datasets.
        """
        statuses = {}
        for r_type in RecordType:
            parquet_path = PROCESSED_DATA_DIR / f"{r_type.value}.parquet"
            latest_log = get_latest_valid_hash(r_type.value)

            if parquet_path.exists() and latest_log:
                try:
                    # Scan parquet lazily with Polars to get row count without full memory loading
                    df_scan = pl.scan_parquet(parquet_path)
                    row_count = df_scan.select(pl.len()).collect().item()
                    candidate_count = (
                        df_scan.select(pl.col("candidate_id").n_unique()).collect().item()
                        if "candidate_id" in df_scan.columns else 0
                    )
                    statuses[r_type.value] = DatasetStatus(
                        record_type=r_type,
                        is_ingested=True,
                        filename=latest_log["filename"],
                        file_hash_sha256=latest_log["file_hash"],
                        row_count=row_count,
                        candidate_count=candidate_count,
                        is_synthetic=bool(latest_log["is_synthetic"]),
                        last_updated=latest_log["timestamp"]
                    )
                except Exception:
                    statuses[r_type.value] = DatasetStatus(
                        record_type=r_type,
                        is_ingested=False
                    )
            else:
                statuses[r_type.value] = DatasetStatus(
                    record_type=r_type,
                    is_ingested=False
                )
        return statuses

    @staticmethod
    def load_sample_preset(preset: str, uploader_identity: str = "investigator_admin") -> Dict[str, IngestionResponse]:
        """
        Loads pre-packaged sample exam datasets from /data/real/ or /data/synthetic/
        and processes them through the standard ingestion pipeline:
        File Bytes -> SHA-256 Checkpoint -> Schema Validation -> SQLite Audit Log -> Parquet Store.
        """
        from app.config import BASE_DIR
        root_data = BASE_DIR / "data" if (BASE_DIR / "data" / "real").exists() else BASE_DIR.parent / "data"
        results: Dict[str, IngestionResponse] = {}

        if preset == "wbssc":
            omr_path = root_data / "real" / "wbssc_omr_scores.csv"
            server_path = root_data / "real" / "wbssc_server_scores.csv"

            if omr_path.exists():
                with open(omr_path, "rb") as f:
                    omr_bytes = f.read()
                results["omr"] = IngestionService.process_ingestion(
                    file_bytes=omr_bytes,
                    filename="wbssc_omr_scores.csv",
                    record_type=RecordType.OMR,
                    uploader_identity=uploader_identity,
                    is_synthetic=False
                )

                # Generate matching seating layout from the OMR records for spatial triage
                df_omr = pl.read_csv(omr_path)
                df_seating = df_omr.select(["candidate_id", "centre_id", "room_id", "seat_number"]).unique()
                buf = io.BytesIO()
                df_seating.write_csv(buf)
                seating_bytes = buf.getvalue()
                results["seating"] = IngestionService.process_ingestion(
                    file_bytes=seating_bytes,
                    filename="wbssc_seating_layout.csv",
                    record_type=RecordType.SEATING,
                    uploader_identity=uploader_identity,
                    is_synthetic=False
                )

            if server_path.exists():
                with open(server_path, "rb") as f:
                    server_bytes = f.read()
                results["server"] = IngestionService.process_ingestion(
                    file_bytes=server_bytes,
                    filename="wbssc_server_scores.csv",
                    record_type=RecordType.SERVER,
                    uploader_identity=uploader_identity,
                    is_synthetic=False
                )

        elif preset == "neet2024":
            neet_path = root_data / "real" / "neet2024_centre_results.csv"
            if neet_path.exists():
                with open(neet_path, "rb") as f:
                    neet_bytes = f.read()
                results["server"] = IngestionService.process_ingestion(
                    file_bytes=neet_bytes,
                    filename="neet2024_centre_results.csv",
                    record_type=RecordType.SERVER,
                    uploader_identity=uploader_identity,
                    is_synthetic=False
                )

                # Generate seating mapping for the NEET centres
                df_neet = pl.read_csv(neet_path)
                df_seating = df_neet.select([
                    pl.col("candidate_id"),
                    pl.col("centre_id"),
                    pl.lit("HALL_01").alias("room_id"),
                    pl.int_range(1, pl.len() + 1).alias("seat_number")
                ])
                buf_seat = io.BytesIO()
                df_seating.write_csv(buf_seat)
                results["seating"] = IngestionService.process_ingestion(
                    file_bytes=buf_seat.getvalue(),
                    filename="neet2024_seating_layout.csv",
                    record_type=RecordType.SEATING,
                    uploader_identity=uploader_identity,
                    is_synthetic=False
                )

                # Generate baseline OMR records so complete triage queue can be computed
                df_omr = df_neet.select([
                    pl.col("candidate_id"),
                    pl.col("centre_id"),
                    pl.lit("HALL_01").alias("room_id"),
                    pl.int_range(1, pl.len() + 1).alias("seat_number"),
                    pl.lit("Q001").alias("question_id"),
                    pl.lit("A").alias("selected_option"),
                    pl.col("final_score").alias("raw_score")
                ])
                buf_omr = io.BytesIO()
                df_omr.write_csv(buf_omr)
                results["omr"] = IngestionService.process_ingestion(
                    file_bytes=buf_omr.getvalue(),
                    filename="neet2024_omr_baseline.csv",
                    record_type=RecordType.OMR,
                    uploader_identity=uploader_identity,
                    is_synthetic=False
                )

        elif preset == "synthetic":
            omr_path = root_data / "synthetic" / "synthetic_omr_responses.csv"
            server_path = root_data / "synthetic" / "synthetic_server_scores.csv"
            seating_path = root_data / "synthetic" / "synthetic_seating_layout.csv"

            if omr_path.exists():
                with open(omr_path, "rb") as f:
                    results["omr"] = IngestionService.process_ingestion(
                        file_bytes=f.read(),
                        filename="synthetic_omr_responses.csv",
                        record_type=RecordType.OMR,
                        uploader_identity=uploader_identity,
                        is_synthetic=True
                    )
            if server_path.exists():
                with open(server_path, "rb") as f:
                    results["server"] = IngestionService.process_ingestion(
                        file_bytes=f.read(),
                        filename="synthetic_server_scores.csv",
                        record_type=RecordType.SERVER,
                        uploader_identity=uploader_identity,
                        is_synthetic=True
                    )
            if seating_path.exists():
                with open(seating_path, "rb") as f:
                    results["seating"] = IngestionService.process_ingestion(
                        file_bytes=f.read(),
                        filename="synthetic_seating_layout.csv",
                        record_type=RecordType.SEATING,
                        uploader_identity=uploader_identity,
                        is_synthetic=True
                    )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unknown sample preset '{preset}'. Available presets: 'wbssc', 'neet2024', 'synthetic'."
            )

        return results

    @staticmethod
    def reset_system_data() -> Dict[str, Any]:
        """
        Clears all ingested dataset files (Parquet & Raw), audit log records,
        and human investigator decisions.
        Ensures a completely clean state without modifying schemas or application code.
        """
        # 1. Clear processed parquet storage
        if PROCESSED_DATA_DIR.exists():
            for p_file in PROCESSED_DATA_DIR.glob("*.parquet"):
                try:
                    p_file.unlink()
                except Exception:
                    pass

        # 2. Clear raw files storage
        if RAW_DATA_DIR.exists():
            for r_file in RAW_DATA_DIR.glob("*"):
                if r_file.is_file():
                    try:
                        r_file.unlink()
                    except Exception:
                        pass

        # 3. Clear database tables
        clear_audit_logs()
        clear_all_decisions()

        return {
            "success": True,
            "message": "System successfully reset: All datasets, computed scores, and audit records cleared."
        }

    @staticmethod
    def get_dataset_preview(
        record_type: RecordType,
        limit: int = 100,
        offset: int = 0,
        only_flagged: bool = False,
        search: Optional[str] = None
    ) -> DatasetPreviewResponse:
        """
        Retrieves raw dataset rows with forensic investigation findings attached.
        Highlights columns/cells that were proven wrong by the multi-layer forensic engine.
        """
        from app.services.triage_service import TriageService

        parquet_path = PROCESSED_DATA_DIR / f"{record_type.value}.parquet"
        if not parquet_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Dataset for '{record_type.value}' has not been ingested yet. Please load a dataset first."
            )

        latest_log = get_latest_valid_hash(record_type.value)
        filename = latest_log["filename"] if latest_log else f"{record_type.value}.csv"

        # Compute forensic anomaly lookup
        all_items, _, _, is_syn = TriageService.compute_all_candidates_scored()
        triage_map: Dict[str, Any] = {item.entity_id: item for item in all_items}

        df = pl.read_parquet(parquet_path)
        internal_cols = {"is_synthetic", "source_sha256", "ingested_at"}
        user_cols = [c for c in df.columns if c not in internal_cols]

        annotated_rows: List[DatasetRowPreview] = []

        for row in df.to_dicts():
            cand_id = str(row.get("candidate_id", ""))
            t_item = triage_map.get(cand_id)

            is_proven_wrong = False
            verdict: Optional[str] = None
            highlight_cols: List[str] = []
            evidence_diff: Optional[Dict[str, Any]] = None

            if record_type == RecordType.SERVER:
                if t_item and (t_item.score_discrepancy or 0) > 0.001:
                    is_proven_wrong = True
                    highlight_cols = ["final_score"]
                    verdict = (
                        f"PROVEN TAMPERED // Real Paper OMR was {t_item.raw_calculated_score:.1f}, "
                        f"but Server published {t_item.server_score:.1f} (+{t_item.score_discrepancy:.1f} marks injected)"
                    )
                    evidence_diff = {
                        "raw_score": t_item.raw_calculated_score,
                        "server_score": t_item.server_score,
                        "discrepancy": t_item.score_discrepancy
                    }
                elif t_item and t_item.combined_risk_score >= 40:
                    is_proven_wrong = True
                    highlight_cols = ["final_score"]
                    verdict = f"ANOMALY FLAGGED // {'; '.join(t_item.primary_flags)}"
                    evidence_diff = {"risk_score": t_item.combined_risk_score}

            elif record_type == RecordType.SEATING:
                if t_item and t_item.micro_risk >= 50:
                    is_proven_wrong = True
                    highlight_cols = ["seat_number", "candidate_id"]
                    verdict = (
                        f"PROVEN COLLUSION // Physical proximity copying in "
                        f"Room {t_item.room_id}, Seat #{t_item.seat_number} (Wollack ω ≥ 3.0)"
                    )
                    evidence_diff = {"micro_risk": t_item.micro_risk, "seat_number": t_item.seat_number}
                elif t_item and (t_item.score_discrepancy or 0) > 0.001:
                    is_proven_wrong = True
                    highlight_cols = ["candidate_id", "seat_number"]
                    verdict = (
                        f"PROVEN FRAUDULENT RECORD // Candidate in Room {row.get('room_id')}, "
                        f"Seat #{row.get('seat_number')} had +{t_item.score_discrepancy:.1f} marks illegally injected"
                    )
                    evidence_diff = {
                        "score_discrepancy": t_item.score_discrepancy,
                        "raw_score": t_item.raw_calculated_score,
                        "server_score": t_item.server_score
                    }
                elif t_item and t_item.combined_risk_score >= 40:
                    is_proven_wrong = True
                    highlight_cols = ["candidate_id"]
                    verdict = f"FLAGGED CANDIDATE // Risk {t_item.combined_risk_score:.0f}/100"
                    evidence_diff = {"risk_score": t_item.combined_risk_score}

            elif record_type == RecordType.OMR:
                sel_opt = row.get("selected_option")
                is_blank = (sel_opt is None or str(sel_opt).strip() in ["", "null", "None"])
                if t_item and (t_item.score_discrepancy or 0) > 0.001:
                    is_proven_wrong = True
                    if is_blank:
                        highlight_cols = ["selected_option", "raw_score"]
                        verdict = (
                            f"PROVEN BLANK BUBBLE // Left blank on paper (0 marks), "
                            f"yet candidate awarded +{t_item.score_discrepancy:.1f} marks on server"
                        )
                    else:
                        highlight_cols = ["raw_score"]
                        verdict = (
                            f"TAMPERED CASE // Paper score sum is {t_item.raw_calculated_score:.1f} "
                            f"vs Published {t_item.server_score:.1f}"
                        )
                    evidence_diff = {
                        "raw_calculated_score": t_item.raw_calculated_score,
                        "server_score": t_item.server_score,
                        "discrepancy": t_item.score_discrepancy
                    }
                elif t_item and t_item.combined_risk_score >= 40:
                    is_proven_wrong = True
                    highlight_cols = ["raw_score"]
                    verdict = f"ANOMALOUS CANDIDATE // {'; '.join(t_item.primary_flags)}"
                    evidence_diff = {"risk_score": t_item.combined_risk_score}

            # Filter row dictionary to user visible columns
            filtered_data = {k: row[k] for k in user_cols if k in row}

            # Search filter
            if search:
                s_lower = search.lower().strip()
                matches_search = any(s_lower in str(v).lower() for v in filtered_data.values())
                if not matches_search:
                    continue

            annotated_rows.append(DatasetRowPreview(
                data=filtered_data,
                is_proven_wrong=is_proven_wrong,
                verdict=verdict,
                highlighted_columns=highlight_cols,
                evidence_diff=evidence_diff
            ))

        total_flagged_count = sum(1 for r in annotated_rows if r.is_proven_wrong)

        if only_flagged:
            annotated_rows = [r for r in annotated_rows if r.is_proven_wrong]

        total_count = len(annotated_rows)
        paged_rows = annotated_rows[offset: offset + limit]

        return DatasetPreviewResponse(
            record_type=record_type,
            filename=filename,
            total_rows=total_count,
            flagged_rows_count=total_flagged_count,
            columns=user_cols,
            rows=paged_rows,
            is_synthetic=is_syn
        )

