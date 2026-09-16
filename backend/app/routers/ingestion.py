from typing import Dict, Optional, List
from fastapi import APIRouter, UploadFile, File, Form, Header, HTTPException, status
import polars as pl

from app.schemas.ingestion import (
    RecordType,
    IngestionResponse,
    DatasetStatus,
    DatasetPreviewResponse,
)
from app.services.ingestion_service import IngestionService
from app.services.sample_generator import generate_synthetic_datasets

router = APIRouter(prefix="/ingest", tags=["Ingestion & Validation"])


@router.get("/preview/{record_type}", response_model=DatasetPreviewResponse)
async def get_dataset_preview(
    record_type: RecordType,
    limit: int = 100,
    offset: int = 0,
    only_flagged: bool = False,
    search: Optional[str] = None
):
    """
    Returns raw dataset rows with forensic investigation findings attached.
    Columns/cells proven wrong or tampered by the multi-layer forensic engine
    are flagged with detailed discrepancy verdicts.
    """
    return IngestionService.get_dataset_preview(
        record_type=record_type,
        limit=limit,
        offset=offset,
        only_flagged=only_flagged,
        search=search
    )


@router.post("", response_model=IngestionResponse)
async def ingest_dataset(
    file: UploadFile = File(..., description="CSV or Parquet dataset file to ingest"),
    record_type: RecordType = Form(..., description="Type of record: 'omr', 'server', or 'seating'"),
    is_synthetic: bool = Form(False, description="Flag indicating if dataset is synthetic/mock"),
    x_uploader_identity: Optional[str] = Header(None, alias="X-Uploader-Identity")
):
    """
    Ingests and validates an OMR, Server, or Seating dataset.
    1. Computes SHA-256 hash
    2. Validates schema using Polars (strictly rejects if columns missing)
    3. Records entry in append-only SQLite audit log
    4. Persists verified Parquet dataset for downstream analysis
    """
    uploader = x_uploader_identity or "Investigator_Admin_01"
    file_bytes = await file.read()

    response = IngestionService.process_ingestion(
        file_bytes=file_bytes,
        filename=file.filename or f"uploaded_{record_type.value}.csv",
        record_type=record_type,
        uploader_identity=uploader,
        is_synthetic=is_synthetic
    )
    return response


@router.get("/status", response_model=Dict[str, DatasetStatus])
async def get_all_datasets_status():
    """
    Returns the current status, row counts, and cryptographic hash verification for all 3 datasets.
    """
    return IngestionService.get_datasets_status()


@router.post("/generate-sample", response_model=Dict[str, IngestionResponse])
async def generate_and_ingest_sample(
    x_uploader_identity: Optional[str] = Header(None, alias="X-Uploader-Identity")
):
    """
    Generates synthetic reference datasets for OMR, Server, and Seating,
    computes SHA-256 cryptographic hashes, and ingests them with `is_synthetic: true`.
    """
    uploader = x_uploader_identity or "Investigator_Admin_01"
    sample_data = generate_synthetic_datasets()
    results = {}

    for key, (data_bytes, filename, is_synthetic) in sample_data.items():
        rec_type = RecordType(key)
        res = IngestionService.process_ingestion(
            file_bytes=data_bytes,
            filename=filename,
            record_type=rec_type,
            uploader_identity=uploader,
            is_synthetic=is_synthetic
        )
        results[key] = res

    return results


@router.post("/load-sample", response_model=Dict[str, IngestionResponse])
async def load_sample_dataset(
    preset: str = "wbssc",
    x_uploader_identity: Optional[str] = Header(None, alias="X-Uploader-Identity")
):
    """
    Loads pre-packaged sample exam files (e.g. 'wbssc', 'neet2024', 'synthetic')
    through the strict verification pipeline (SHA-256 hash -> schema validation -> SQLite audit log -> Parquet store).
    """
    uploader = x_uploader_identity or "Investigator_Admin_01"
    return IngestionService.load_sample_preset(preset=preset, uploader_identity=uploader)


@router.post("/reset")
async def reset_system():
    """
    Administrative full system reset:
    Clears all ingested records, computed risk scores, queue items, and audit logs.
    """
    return IngestionService.reset_system_data()
