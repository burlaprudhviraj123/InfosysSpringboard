import pytest
from app.models.waste import WasteBatch

def test_create_and_retrieve_batches(client, operator_headers, db_session):
    payload = {
        "fabric_type": "Cotton",
        "quantity": 45.5,
        "source": "Garment Mill A",
        "condition": "Good",
        "color": "White",
        "image_path": "/static/uploads/test_sample.jpg",
        "collection_date": "2026-08-18T10:00:00",
        "waste_category": "Recyclable",
        "recycling_recommendation": "Mechanical Fiber Shredding",
        "circularity_score": 88.5,
        "damage_score": 12.0,
        "contamination_detected": False,
        "confidence_score": 92.4,
        "structural_integrity": 88.0,
        "stain_risk": 5.0,
        "weave_pattern": "Twill"
    }
    create_res = client.post("/api/inventory/batches", json=payload, headers=operator_headers)
    assert create_res.status_code == 201, f"Failed create batch: {create_res.text}"
    created_batch = create_res.json()
    assert created_batch["id"] is not None
    assert created_batch["quantity"] == 45.5
    assert created_batch["fabric_type"] == "Cotton"
    assert created_batch["damage_score"] == 12.0
    assert created_batch["contamination_detected"] is False
    assert created_batch["confidence_score"] == 92.4
    assert created_batch["structural_integrity"] == 88.0
    assert created_batch["stain_risk"] == 5.0
    assert created_batch["weave_pattern"] == "Twill"

    # Retrieve batches
    get_res = client.get("/api/inventory/batches", headers=operator_headers)
    assert get_res.status_code == 200
    batch_list = get_res.json()
    assert len(batch_list) >= 1
    assert any(b["id"] == created_batch["id"] for b in batch_list)

def test_human_condition_independent_from_ai_evidence(client, operator_headers, db_session):
    # Operator selects "Fair" despite AI seeing low damage (e.g. 8%)
    payload = {
        "fabric_type": "Denim",
        "quantity": 60.0,
        "source": "Factory Offcuts",
        "condition": "Fair", # Human-confirmed condition
        "color": "Indigo",
        "image_path": "/static/uploads/test_denim.jpg",
        "collection_date": "2026-08-18T10:00:00",
        "damage_score": 8.0,
        "contamination_detected": True,
        "confidence_score": 96.2,
        "structural_integrity": 92.0,
        "stain_risk": 35.0,
        "weave_pattern": "Denim Twill"
    }
    res = client.post("/api/inventory/batches", json=payload, headers=operator_headers)
    assert res.status_code == 201
    data = res.json()
    
    # 1. Human decision preserved
    assert data["condition"] == "Fair"
    
    # 2. AI diagnostic evidence preserved
    assert data["damage_score"] == 8.0
    assert data["contamination_detected"] is True
    assert data["confidence_score"] == 96.2
    assert data["structural_integrity"] == 92.0
    assert data["stain_risk"] == 35.0
    assert data["weave_pattern"] == "Denim Twill"
    
    # 3. Backend-calculated strategy uses human condition
    assert data["waste_category"] == "Recyclable"
    assert data["recycling_recommendation"] == "Mechanical Recycling"

def test_delete_batch_rbac(client, operator_headers, manager_headers, admin_headers, operator_user):
    # Create batch as operator
    payload = {
        "fabric_type": "Polyester",
        "quantity": 20.0,
        "source": "Textile Mill B",
        "condition": "Fair",
        "color": "Blue",
        "image_path": "/static/uploads/test_sample.jpg",
        "collection_date": "2026-08-18T10:00:00"
    }
    create_res = client.post("/api/inventory/batches", json=payload, headers=operator_headers)
    assert create_res.status_code == 201, f"Create failed: {create_res.text}"
    batch_id = create_res.json()["id"]

    # Manager should not be able to delete another's batch unless admin/author
    mgr_del_res = client.delete(f"/api/inventory/batches/{batch_id}", headers=manager_headers)
    assert mgr_del_res.status_code == 403

    # Admin CAN delete any batch
    admin_del_res = client.delete(f"/api/inventory/batches/{batch_id}", headers=admin_headers)
    assert admin_del_res.status_code == 204
