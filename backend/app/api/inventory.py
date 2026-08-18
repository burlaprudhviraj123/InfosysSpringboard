import os
import shutil
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.waste import WasteBatch
from app.api.auth import get_current_user
from app.api.image_processing import analyze_image_properties
from app.api.classifier import fabric_classifier

router = APIRouter()

# Schemas strictly following Sections 3, 4, 5, and 6
class AnalyzeResponse(BaseModel):
    image_path: str
    fabric_type: str
    color: str
    color_hex: str
    secondary_color: str
    dye_fastness: str
    weave_pattern: str
    thread_density: str
    texture_variance: Optional[float] = 0.0
    structural_integrity: float
    damage_score: float
    pilling_grade: str
    stain_risk: float
    contamination_detected: bool
    confidence_score: float
    confidence: Optional[float] = 0.0
    top_predictions: Optional[List[dict]] = []
    model_metadata: Optional[dict] = {}
    estimated_composition: Optional[str] = "100% Fiber"
    blend_identification: str
    material_quality: str
    breathability: str
    waste_category: str
    recycling_recommendation: str
    sorting_bin: str
    preprocessing: str
    safety_warning: str

    model_config = {"protected_namespaces": ()}

class BatchCreate(BaseModel):
    image_path: str
    fabric_type: str
    color: str
    source: str
    quantity: float
    condition: str
    collection_date: Optional[str] = None
    waste_category: Optional[str] = None
    recycling_recommendation: Optional[str] = None
    recovery_category: Optional[str] = None
    circularity_score: Optional[float] = None

class BatchResponse(BaseModel):
    id: int
    fabric_type: str
    source: str
    quantity: float
    color: str
    condition: str
    collection_date: datetime
    operator_id: int
    circularity_score: Optional[float]
    image_path: Optional[str]
    waste_category: Optional[str]
    recycling_recommendation: Optional[str]
    recovery_category: Optional[str]

    class Config:
        from_attributes = True

def require_operator_or_admin(current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.OPERATOR, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied. Requires Operator or Administrator role."
        )
    return current_user

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied. Requires Administrator role."
        )
    return current_user

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "static", "uploads")

# Step 1: Upload & Analyze Image (Non-Persisting — Runs ML Classifier + CV Analytics)
@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_fabric_image(
    file: UploadFile = File(...),
    current_user: User = Depends(require_operator_or_admin)
):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save image: {str(e)}")

    # Section 4: Deep Learning Material Classification Engine (EfficientNet-B0 PyTorch)
    ml_result = fabric_classifier.predict(file_path)
    predicted_fabric = ml_result["predicted_material"]
    confidence_score = ml_result["confidence_pct"]
    confidence_float = ml_result["confidence"]
    top_preds = ml_result["top_predictions"]
    model_meta = ml_result["model_metadata"]
    
    # Section 3: Textile Image Feature Extraction (OpenCV)
    diag = analyze_image_properties(file_path)

    # Section 5 & 6: Deterministic Waste Classification & Recycling Strategy Rules
    contamination = diag["contamination_detected"]
    damage_score = diag["damage_score"]
    
    natural_fabrics = ["Cotton", "Denim", "Wool", "Linen", "Silk"]
    synthetic_fabrics = ["Polyester", "Nylon", "Rayon (Viscose)", "Rayon", "Acrylic"]

    # Waste Category Determination (6 Categories: Recyclable, Reusable, Repairable, Upcyclable, Compostable, Hazardous Textile Waste)
    if contamination:
        waste_category = "Hazardous Textile Waste"
        recycling_recommendation = "Industrial Recovery"
        material_quality = "Grade D (Contaminated/Low)"
    elif predicted_fabric in natural_fabrics and damage_score < 15.0:
        waste_category = "Upcyclable"
        recycling_recommendation = "Upcycling"
        material_quality = "Grade A (Premium High Quality)"
    elif predicted_fabric in natural_fabrics and damage_score > 60.0:
        waste_category = "Compostable"
        recycling_recommendation = "Donation"
        material_quality = "Grade C (Degraded Organic)"
    elif predicted_fabric in synthetic_fabrics:
        waste_category = "Recyclable"
        recycling_recommendation = "Chemical Recycling"
        material_quality = "Grade B (Synthetic Polymer Feedstock)"
    elif damage_score > 35.0:
        waste_category = "Repairable"
        recycling_recommendation = "Mechanical Recycling"
        material_quality = "Grade B- (Shredding Quality)"
    else:
        waste_category = "Reusable"
        recycling_recommendation = "Fabric Reuse"
        material_quality = "Grade A- (Direct Garment Reuse)"

    # Blend Identification
    if predicted_fabric in natural_fabrics:
        blend_id = "Single-Origin Natural Fiber"
    elif predicted_fabric in synthetic_fabrics:
        blend_id = "100% Synthetic Polymer"
    else:
        blend_id = "Multi-Component Poly-Cotton Blend"

    # Important: AI Analysis is non-persisting. No database record is inserted here.
    return {
        "image_path": f"/static/uploads/{unique_filename}",
        "fabric_type": predicted_fabric,
        "color": diag["color"],
        "color_hex": diag["color_hex"],
        "secondary_color": diag["secondary_color"],
        "dye_fastness": diag["dye_fastness"],
        "weave_pattern": diag["weave_pattern"],
        "thread_density": diag["thread_density"],
        "texture_variance": diag.get("texture_variance", 0.0),
        "structural_integrity": diag["structural_integrity"],
        "damage_score": diag["damage_score"],
        "pilling_grade": diag["pilling_grade"],
        "stain_risk": diag["stain_risk"],
        "contamination_detected": diag["contamination_detected"],
        "confidence_score": confidence_score,
        "confidence": confidence_float,
        "top_predictions": top_preds,
        "model_metadata": model_meta,
        "estimated_composition": diag.get("estimated_composition", "100% Primary Fiber"),
        "blend_identification": blend_id,
        "material_quality": material_quality,
        "breathability": diag.get("breathability", "High Flow"),
        "waste_category": waste_category,
        "recycling_recommendation": recycling_recommendation,
        "sorting_bin": diag.get("sorting_bin", "Bin A-1: Upcycling Atelier"),
        "preprocessing": diag.get("preprocessing", "Standard Trim"),
        "safety_warning": diag.get("safety_warning", "Safe (Standard PPE)")
    }

# Step 2: Confirm & Save to Inventory Database
from app.api.sustainability import compute_circularity_score_and_category

@router.post("/batches", response_model=BatchResponse, status_code=status.HTTP_201_CREATED)
def create_batch(
    batch_in: BatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_operator_or_admin)
):
    # Determine waste category and recommendation rules
    natural_fabrics = ["Cotton", "Wool", "Silk", "Linen", "Denim"]
    
    # 5-Factor scoring parameters aligned with Section 9 of PDF Spec
    condition_scores = {"New": 95.0, "Good": 85.0, "Fair": 65.0, "Poor": 40.0, "Damaged": 20.0}
    recyclability_scores = {"Cotton": 90.0, "Denim": 85.0, "Wool": 80.0, "Silk": 75.0, "Linen": 85.0, "Polyester": 70.0, "Nylon": 65.0, "Rayon": 60.0, "Acrylic": 55.0, "Mixed Fabrics": 45.0}
    reuse_scores = {"New": 95.0, "Good": 85.0, "Fair": 55.0, "Poor": 25.0, "Damaged": 10.0}
    
    condition_val = condition_scores.get(batch_in.condition, 70.0)
    recyclability_val = recyclability_scores.get(batch_in.fabric_type, 65.0)
    reuse_val = reuse_scores.get(batch_in.condition, 50.0)
    env_benefit = 90.0 if batch_in.fabric_type in natural_fabrics else 65.0
    feasibility_val = 85.0 if batch_in.fabric_type in ["Cotton", "Polyester", "Denim"] else 70.0
    
    circularity_score, recovery_category = compute_circularity_score_and_category(
        recyclability=recyclability_val,
        condition=condition_val,
        reuse_potential=reuse_val,
        environmental_benefit=env_benefit,
        processing_feasibility=feasibility_val
    )

    if batch_in.condition in ["New", "Good"] and batch_in.fabric_type in natural_fabrics:
        waste_category = "Upcyclable"
        recycling_recommendation = "Upcycling"
    elif batch_in.fabric_type in ["Polyester", "Nylon", "Rayon", "Acrylic"]:
        waste_category = "Recyclable"
        recycling_recommendation = "Chemical Recycling"
    elif batch_in.condition == "Fair":
        waste_category = "Recyclable"
        recycling_recommendation = "Mechanical Recycling"
    elif batch_in.condition == "Damaged":
        waste_category = "Repairable"
        recycling_recommendation = "Fiber Recycling"
    else:
        waste_category = "Reusable"
        recycling_recommendation = "Fabric Reuse"

    # Parse optional collection_date
    parsed_date = datetime.utcnow()
    if batch_in.collection_date:
        try:
            parsed_date = datetime.strptime(batch_in.collection_date, "%Y-%m-%d")
        except Exception:
            try:
                parsed_date = datetime.fromisoformat(batch_in.collection_date.replace("Z", "+00:00"))
            except Exception:
                parsed_date = datetime.utcnow()

    db_batch = WasteBatch(
        fabric_type=batch_in.fabric_type,
        source=batch_in.source,
        quantity=batch_in.quantity,
        color=batch_in.color,
        condition=batch_in.condition,
        collection_date=parsed_date,
        operator_id=current_user.id,
        circularity_score=circularity_score,
        image_path=batch_in.image_path,
        waste_category=waste_category,
        recycling_recommendation=recycling_recommendation,
        recovery_category=recovery_category
    )
    db.add(db_batch)
    db.commit()
    db.refresh(db_batch)
    return db_batch

@router.get("/batches", response_model=List[BatchResponse])
def list_batches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(WasteBatch).all()

@router.get("/batches/{batch_id}", response_model=BatchResponse)
def get_batch(
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    batch = db.query(WasteBatch).filter(WasteBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Waste batch not found")
    return batch

@router.delete("/batches/{batch_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_batch(
    batch_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    batch = db.query(WasteBatch).filter(WasteBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Waste batch not found")
    
    if batch.image_path:
        local_filename = batch.image_path.split("/")[-1]
        local_path = os.path.join(UPLOAD_DIR, local_filename)
        if os.path.exists(local_path):
            try:
                os.remove(local_path)
            except Exception:
                pass

    db.delete(batch)
    db.commit()
    return None
