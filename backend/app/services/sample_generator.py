import io
import random
from datetime import datetime, timezone
from typing import Dict, Tuple
import polars as pl


def generate_synthetic_datasets(
    num_centres: int = 5,
    rooms_per_centre: int = 2,
    seats_per_room: int = 20,
    num_questions: int = 50
) -> Dict[str, Tuple[bytes, str, bool]]:
    """
    Generates synthetic, deterministic mock exam datasets for offline development & testing.
    Contains:
    - 95% normal candidates with uncorrelated errors
    - 12 specific adjacent collusion pairs with Wollack Omega >= 3.0
    All generated outputs are explicitly marked with `is_synthetic = True`.
    """
    random.seed(42)

    seating_records = []
    omr_records = []
    server_records = []

    # Question answer key (for realistic simulation)
    options = ["A", "B", "C", "D"]
    answer_key = {f"Q{q:03d}": options[(q * 3) % 4] for q in range(1, num_questions + 1)}

    collusion_pair_definitions = [
        ("CENTRE_001", "R01", 4, 5),
        ("CENTRE_001", "R01", 12, 13),
        ("CENTRE_002", "R01", 8, 9),
        ("CENTRE_002", "R01", 16, 17),
        ("CENTRE_003", "R01", 4, 5),
        ("CENTRE_003", "R01", 6, 7),
        ("CENTRE_003", "R01", 12, 13),
        ("CENTRE_004", "R02", 2, 3),
        ("CENTRE_004", "R02", 14, 15),
        ("CENTRE_005", "R01", 9, 10),
        ("CENTRE_005", "R01", 18, 19),
        ("CENTRE_005", "R02", 5, 6),
    ]

    collusion_lookup = {}
    for c_id, r_id, s1, s2 in collusion_pair_definitions:
        collusion_lookup[(c_id, r_id, s1)] = ("SOURCE", s2)
        collusion_lookup[(c_id, r_id, s2)] = ("COPIER", s1)

    candidate_responses_cache = {}

    for c in range(1, num_centres + 1):
        centre_id = f"CENTRE_{c:03d}"
        for r in range(1, rooms_per_centre + 1):
            room_id = f"R{r:02d}"
            for s in range(1, seats_per_room + 1):
                seat_num = s
                candidate_id = f"CAND_{c:03d}_{r:02d}_{s:03d}"

                seating_records.append({
                    "candidate_id": candidate_id,
                    "centre_id": centre_id,
                    "room_id": room_id,
                    "seat_number": seat_num
                })

                collusion_info = collusion_lookup.get((centre_id, room_id, seat_num))
                cand_responses = {}
                cand_total_score = 0.0

                if collusion_info and collusion_info[0] == "COPIER":
                    source_seat = collusion_info[1]
                    source_cand_id = f"CAND_{c:03d}_{r:02d}_{source_seat:03d}"
                    source_resps = candidate_responses_cache.get(source_cand_id, {})

                    for q_idx in range(1, num_questions + 1):
                        q_id = f"Q{q_idx:03d}"
                        correct_opt = answer_key[q_id]
                        s_selected, s_score = source_resps.get(q_id, (correct_opt, 4.0))

                        if random.random() < 0.88:
                            selected = s_selected
                            score = s_score
                        else:
                            if random.random() < 0.5:
                                selected = correct_opt
                                score = 4.0
                            else:
                                wrong_opts = [opt for opt in options if opt != correct_opt]
                                selected = random.choice(wrong_opts)
                                score = -1.0

                        cand_responses[q_id] = (selected, score)
                        cand_total_score += score

                        omr_records.append({
                            "candidate_id": candidate_id,
                            "centre_id": centre_id,
                            "room_id": room_id,
                            "seat_number": seat_num,
                            "question_id": q_id,
                            "selected_option": selected,
                            "raw_score": score
                        })
                else:
                    ability = random.uniform(0.40, 0.78)
                    if centre_id == "CENTRE_003":
                        ability = random.uniform(0.72, 0.90)

                    for q_idx in range(1, num_questions + 1):
                        q_id = f"Q{q_idx:03d}"
                        correct_opt = answer_key[q_id]

                        if random.random() < ability:
                            selected = correct_opt
                            score = 4.0
                        else:
                            if random.random() < 0.1:
                                selected = None
                                score = 0.0
                            else:
                                wrong_opts = [opt for opt in options if opt != correct_opt]
                                selected = random.choice(wrong_opts)
                                score = -1.0

                        cand_responses[q_id] = (selected, score)
                        cand_total_score += score

                        omr_records.append({
                            "candidate_id": candidate_id,
                            "centre_id": centre_id,
                            "room_id": room_id,
                            "seat_number": seat_num,
                            "question_id": q_id,
                            "selected_option": selected,
                            "raw_score": score
                        })

                candidate_responses_cache[candidate_id] = cand_responses

                final_score = cand_total_score
                if candidate_id == "CAND_001_01_005":
                    final_score += 25.0
                elif candidate_id == "CAND_002_01_012":
                    final_score -= 15.0

                server_records.append({
                    "candidate_id": candidate_id,
                    "final_score": round(final_score, 2),
                    "server_timestamp": datetime.now(timezone.utc).isoformat()
                })

    # Convert to Polars DataFrames and export to CSV bytes
    df_omr = pl.DataFrame(omr_records)
    df_server = pl.DataFrame(server_records)
    df_seating = pl.DataFrame(seating_records)

    omr_buf = io.BytesIO()
    df_omr.write_csv(omr_buf)

    server_buf = io.BytesIO()
    df_server.write_csv(server_buf)

    seating_buf = io.BytesIO()
    df_seating.write_csv(seating_buf)

    return {
        "omr": (omr_buf.getvalue(), "synthetic_omr_responses.csv", True),
        "server": (server_buf.getvalue(), "synthetic_server_scores.csv", True),
        "seating": (seating_buf.getvalue(), "synthetic_seating_layout.csv", True),
    }

