import io
import pytest
from PIL import Image
from app.models.waste import WasteBatch

def create_test_image_bytes(color=(120, 150, 200), size=(224, 224)):
    img = Image.new("RGB", size, color=color)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    return buf

def test_image_analysis_pipeline(client, operator_headers, db_session):
    img_bytes = create_test_image_bytes()
    files = {"file": ("test_sample.jpg", img_bytes, "image/jpeg")}

    # Initial batch count
    initial_count = db_session.query(WasteBatch).count()

    res = client.post("/api/inventory/analyze", files=files, headers=operator_headers)
    assert res.status_code == 200, f"Analysis failed: {res.text}"
    data = res.json()

    # 1. Output schema checks
    assert "fabric_type" in data
    assert "confidence_score" in data
    assert "top_predictions" in data
    assert "waste_category" in data
    assert "recycling_recommendation" in data
    assert "structural_integrity" in data
    assert "damage_score" in data
    assert "pilling_grade" in data
    assert "sorting_bin" in data

    # 2. 10-Class taxonomy output via top predictions
    assert len(data["top_predictions"]) >= 3
    for pred in data["top_predictions"]:
        assert "class" in pred or "fabric_type" in pred or "label" in pred or "class_name" in pred
        assert "confidence" in pred or "probability" in pred

    # 3. Critical requirement: AI Analysis does NOT create a batch record prematurely
    final_count = db_session.query(WasteBatch).count()
    assert final_count == initial_count, "AI analysis must NOT create a WasteBatch automatically!"
