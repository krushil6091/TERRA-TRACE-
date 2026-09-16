import pytest
from tests.benchmarks.benchmark_wbssc import run_wbssc_validation
from tests.benchmarks.benchmark_neet2024 import run_neet2024_validation
from tests.benchmarks.benchmark_wollack_holland import run_wollack_holland_validation


def test_benchmark_1_wbssc_reconciliation():
    """
    Validates that the Reconciliation layer flags 100% of manipulated scores
    (single digits inflated to just above cutoff) with zero false positives.
    """
    res = run_wbssc_validation()
    assert res["status"] == "PASS"
    assert res["manipulated_cases_detected"] == 15
    assert res["false_positives"] == 0
    assert res["sensitivity"] == 1.0


def test_benchmark_2_neet2024_macro_anomaly():
    """
    Validates that the Macro layer independently ranks Haryana 6-topper centre
    and Rajkot centre as #1 and #2 most anomalous across 10 national cohorts.
    """
    res = run_neet2024_validation()
    assert res["status"] == "PASS"
    assert "CENTRE_HR_230101" in [res["rank_1"], res["rank_2"]]
    assert "CENTRE_GJ_220101" in [res["rank_1"], res["rank_2"]]


def test_benchmark_3_micro_wollack_holland():
    """
    Validates that the Micro layer's Omega (Wollack 1997) and K-Index (Holland 1996)
    match published psychometric literature values for colluding vs independent examinees.
    """
    res = run_wollack_holland_validation()
    assert res["status"] == "PASS"
    assert res["colluding_pair"]["omega_statistic"] >= 4.0
    assert res["colluding_pair"]["holland_k_index"] < 0.0001
    assert res["independent_pair"]["omega_statistic"] < 2.0
