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
        "circularity_score": 88.5
    }
    create_res = client.post("/api/inventory/batches", json=payload, headers=operator_headers)
    assert create_res.status_code == 201, f"Failed create batch: {create_res.text}"
    created_batch = create_res.json()
    assert created_batch["id"] is not None
    assert created_batch["quantity"] == 45.5
    assert created_batch["fabric_type"] == "Cotton"

    # Retrieve batches
    get_res = client.get("/api/inventory/batches", headers=operator_headers)
    assert get_res.status_code == 200
    batch_list = get_res.json()
    assert len(batch_list) >= 1
    assert any(b["id"] == created_batch["id"] for b in batch_list)

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
