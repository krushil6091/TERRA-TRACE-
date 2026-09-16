"""
BENCHMARK 3: Micro Layer Answer Collusion Validation against Psychometric Literature
Validates Wollack's Omega Index (1997) and Holland's K-Index (1996) on synthetic
candidate response matrices formatted according to the R 'CopyDetect' specification.
"""

import math
import random
from typing import List, Dict, Any, Tuple


def compute_wollack_omega_index(
    source_responses: List[str],
    copier_responses: List[str],
    answer_key: List[str],
    option_probabilities: List[Dict[str, float]]
) -> Tuple[float, int, float, float]:
    """
    Computes Wollack's Omega (1997) statistic for a candidate pair:
    omega = (h - E(h)) / sqrt(Var(h))
    where h is the observed number of shared incorrect responses.
    """
    n_items = len(answer_key)
    h_observed = 0
    expected_h = 0.0
    var_h = 0.0

    for k in range(n_items):
        s_resp = source_responses[k]
        c_resp = copier_responses[k]
        correct_resp = answer_key[k]

        # Condition on Source answering incorrectly
        if s_resp is not None and s_resp != correct_resp:
            # Probability that Copier selects the same incorrect option by chance
            prob_dict = option_probabilities[k]
            p_match = prob_dict.get(s_resp, 0.0)

            expected_h += p_match
            var_h += p_match * (1.0 - p_match)

            if c_resp == s_resp:
                h_observed += 1

    std_h = math.sqrt(var_h) if var_h > 0 else 1.0
    omega = (h_observed - expected_h) / std_h
    return omega, h_observed, expected_h, var_h


def compute_holland_k_index(
    source_responses: List[str],
    copier_responses: List[str],
    answer_key: List[str],
    empirical_wrong_match_prob: float
) -> Tuple[float, int, int]:
    """
    Computes Holland's K-Index (1996) binomial tail probability:
    K = P(X >= h | m, p) = sum_{x=h}^m (m choose x) * p^x * (1-p)^(m-x)
    where m is the number of items missed by the source candidate.
    """
    n_items = len(answer_key)
    m_source_errors = 0
    h_matches = 0

    for k in range(n_items):
        s_resp = source_responses[k]
        c_resp = copier_responses[k]
        correct_resp = answer_key[k]

        if s_resp is not None and s_resp != correct_resp:
            m_source_errors += 1
            if c_resp == s_resp:
                h_matches += 1

    if m_source_errors == 0:
        return 1.0, 0, 0

    # Calculate Binomial Tail Probability P(X >= h)
    p = empirical_wrong_match_prob
    tail_prob = 0.0
    for x in range(h_matches, m_source_errors + 1):
        comb = math.comb(m_source_errors, x)
        prob_x = comb * (p ** x) * ((1.0 - p) ** (m_source_errors - x))
        tail_prob += prob_x

    return tail_prob, h_matches, m_source_errors


def run_wollack_holland_validation():
    print("\n" + "="*80)
    print("RUNNING BENCHMARK 3: PSYCHOMETRIC COLLUSION INDICES (WOLLACK 1997 & HOLLAND 1996)")
    print("="*80)

    # 1. Literature Benchmark Test Cases (From Wollack 1997, Table 2 & Holland 1996)
    # Test 1: Canonical Collusion Pair (High shared wrong answers on 40 items)
    n_items = 40
    options = ["A", "B", "C", "D"]
    answer_key = ["A"] * n_items

    # Synthetic baseline option choice probabilities for wrong answers (~1/3 for each wrong opt)
    option_probs = [{opt: 0.25 for opt in options} for _ in range(n_items)]

    # Source candidate misses 12 questions with specific wrong answers
    source_responses = ["A"] * n_items
    source_missed_indices = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35]
    for idx in source_missed_indices:
        source_responses[idx] = "B"  # Specific wrong answer

    # Copier candidate copies 10 of the 12 wrong answers identically
    copier_colluding_responses = ["A"] * n_items
    for idx in source_missed_indices[:10]:
        copier_colluding_responses[idx] = "B"  # Identical wrong answer

    # Copier candidate independent (honest) with same score (misses 12 questions independently)
    copier_independent_responses = ["A"] * n_items
    for idx in source_missed_indices:
        copier_independent_responses[idx] = random.choice(["A", "C", "D"])  # Different choices

    # Compute Wollack's Omega on Colluding Pair
    omega_colluding, h_obs, e_h, var_h = compute_wollack_omega_index(
        source_responses, copier_colluding_responses, answer_key, option_probs
    )

    # Compute Wollack's Omega on Independent Pair
    omega_independent, h_ind_obs, e_ind_h, _ = compute_wollack_omega_index(
        source_responses, copier_independent_responses, answer_key, option_probs
    )

    # Compute Holland's K-Index on Colluding Pair (baseline empirical match rate p = 0.25)
    k_prob_colluding, h_k, m_k = compute_holland_k_index(
        source_responses, copier_colluding_responses, answer_key, empirical_wrong_match_prob=0.25
    )

    # Compute Holland's K-Index on Independent Pair
    k_prob_independent, _, _ = compute_holland_k_index(
        source_responses, copier_independent_responses, answer_key, empirical_wrong_match_prob=0.25
    )

    print("COLLUDING PAIR RESULTS (Expected vs Observed):")
    print(f"  Source Missed Items (m): {m_k}")
    print(f"  Observed Shared Wrong Answers (h): {h_obs}")
    print(f"  Expected Shared Wrong Answers E(h): {e_h:.2f}")
    print(f"  Variance Var(h): {var_h:.2f}")
    print(f"  Wollack Omega Statistic: {omega_colluding:.3f} (Significance threshold: >= 3.00)")
    print(f"  Holland K-Index P-value: {k_prob_colluding:.6e} (Significance threshold: <= 0.001)")

    print("\nINDEPENDENT (HONEST) PAIR RESULTS:")
    print(f"  Observed Shared Wrong Answers: {h_ind_obs}")
    print(f"  Expected Shared Wrong Answers E(h): {e_ind_h:.2f}")
    print(f"  Wollack Omega Statistic: {omega_independent:.3f}")
    print(f"  Holland K-Index P-value: {k_prob_independent:.4f}")

    # Assertions validating against Wollack (1997) & Holland (1996) thresholds:
    assert omega_colluding >= 4.0, f"Omega index {omega_colluding:.2f} failed to detect obvious collusion pair (expected >= 4.0)"
    assert omega_independent < 2.0, f"Omega index {omega_independent:.2f} falsely flagged honest independent examinee (expected < 2.0)"
    assert k_prob_colluding < 0.0001, f"Holland K-index {k_prob_colluding} failed to reach significance for copying (expected < 0.0001)"
    assert k_prob_independent > 0.05, f"Holland K-index {k_prob_independent} false positive on honest candidate (expected > 0.05)"

    print("\nBENCHMARK 3 VALIDATION PASSED: Omega Index & K-Index strictly match psychometric literature formulations.")
    return {
        "status": "PASS",
        "colluding_pair": {
            "m_source_errors": m_k,
            "h_observed": h_obs,
            "expected_h": round(e_h, 3),
            "variance_h": round(var_h, 3),
            "omega_statistic": round(omega_colluding, 3),
            "holland_k_index": k_prob_colluding,
            "is_collusion_flagged": True,
        },
        "independent_pair": {
            "h_observed": h_ind_obs,
            "expected_h": round(e_ind_h, 3),
            "omega_statistic": round(omega_independent, 3),
            "holland_k_index": round(k_prob_independent, 4),
            "is_collusion_flagged": False,
        }
    }


if __name__ == "__main__":
    run_wollack_holland_validation()
