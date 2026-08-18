import pytest
from app.models.waste import WasteBatch

def test_sustainability_metrics_zero_state(client, manager_headers, db_session):
    # Ensure no batches
    db_session.query(WasteBatch).delete()
    db_session.commit()

    res = client.get("/api/sustainability/metrics", headers=manager_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_weight_kg"] == 0.0
    assert data["co2_saved_kg"] == 0.0
    assert data["water_saved_liters"] == 0.0
    assert data["landfill_diversion_rate"] == 0.0

def test_sustainability_metrics_live_calculation(client, manager_headers, db_session, operator_user):
    # Insert a test batch
    b = WasteBatch(
        fabric_type="Denim",
        quantity=100.0,
        source="Factory 1",
        condition="Good",
        color="Indigo",
        circularity_score=85.0,
        operator_id=operator_user.id
    )
    db_session.add(b)
    db_session.commit()

    res = client.get("/api/sustainability/metrics", headers=manager_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_weight_kg"] == 100.0
    assert data["co2_saved_kg"] == 360.0  # 100 * 3.6
    assert data["water_saved_liters"] == 25000.0  # 100 * 250
    assert data["avg_circularity_score"] == 85.0

def test_manufacturer_analytics(client, manager_headers, db_session, operator_user):
    res = client.get("/api/sustainability/manufacturer-analytics", headers=manager_headers)
    assert res.status_code == 200
    data = res.json()
    assert "production_offcuts_kg" in data
    assert "recycled_material_recovered_kg" in data
    assert "raw_material_cost_saved" in data
    assert "waste_reduction_rate" in data
    assert "circularity_rating" in data
