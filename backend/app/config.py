import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
DB_PATH = DATA_DIR / "audit.db"

RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)

PROJECT_NAME = "Terra Trace"
API_V1_PREFIX = "/api"

# ==============================================================================
# RISK SCORING WEIGHTING CONSTANTS (Canonical Configuration)
# Formula: Composite_Risk = (W_REC * Rec_Risk) + (W_MACRO * Macro_Risk) + (W_MICRO * Micro_Risk)
# Constraint: W_RECONCILIATION + W_MACRO + W_MICRO == 1.0
# ==============================================================================
WEIGHT_RECONCILIATION: float = 0.45  # Weight for raw OMR vs server published score discrepancy
WEIGHT_MACRO: float = 0.35           # Weight for centre-level statistical KS divergence & skewness
WEIGHT_MICRO: float = 0.20           # Weight for physical seating proximity collusion (Omega / K-Index)
