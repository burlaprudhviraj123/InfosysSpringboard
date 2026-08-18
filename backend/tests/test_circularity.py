import pytest
from app.api.sustainability import compute_circularity_score_and_category

def test_circularity_scoring_formula():
    # Test formula: 0.35*R + 0.20*C + 0.20*U + 0.15*E + 0.10*F
    score, category = compute_circularity_score_and_category(
        recyclability=90.0,
        condition=85.0,
        reuse_potential=80.0,
        environmental_benefit=95.0,
        processing_feasibility=90.0
    )
    expected = round((0.35 * 90.0) + (0.20 * 85.0) + (0.20 * 80.0) + (0.15 * 95.0) + (0.10 * 90.0), 1)
    assert score == expected
    assert 0.0 <= score <= 100.0
    assert category in [
        "Excellent Recovery Potential",
        "High Recovery Potential",
        "Moderate Recovery Potential",
        "Limited Recovery Potential",
        "Disposal Recommended"
    ]

def test_circularity_score_categories():
    # High score -> Excellent Recovery Potential
    high_score, high_cat = compute_circularity_score_and_category(95.0, 95.0, 95.0, 95.0, 95.0)
    assert high_score >= 85.0
    assert high_cat == "Excellent Recovery Potential"

    # Low score -> Disposal Recommended
    low_score, low_cat = compute_circularity_score_and_category(10.0, 10.0, 10.0, 10.0, 10.0)
    assert low_score < 30.0
    assert low_cat == "Disposal Recommended"

def test_circularity_score_api(client, manager_headers):
    payload = {
        "recyclability": 85.0,
        "condition": 80.0,
        "reuse_potential": 75.0,
        "environmental_benefit": 90.0,
        "processing_feasibility": 80.0
    }
    res = client.post("/api/sustainability/calculate-score", json=payload, headers=manager_headers)
    assert res.status_code == 200
    data = res.json()
    assert "circularity_score" in data
    assert "category" in data
    assert "breakdown" in data
