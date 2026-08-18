from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class WasteBatch(Base):
    __tablename__ = "waste_batches"

    id = Column(Integer, primary_key=True, index=True)
    fabric_type = Column(String, nullable=False)  # Cotton, Polyester, etc.
    source = Column(String, nullable=False)       # Source of waste
    quantity = Column(Float, nullable=False)      # Quantity in kg
    color = Column(String, nullable=False)
    condition = Column(String, nullable=False)    # New, Good, Fair, Poor, Damaged (Human confirmed)
    collection_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    operator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    circularity_score = Column(Float, nullable=True)
    image_path = Column(String, nullable=True)
    waste_category = Column(String, nullable=True)          # Recyclable, Reusable, Upcyclable, etc.
    recycling_recommendation = Column(String, nullable=True)# Mechanical Recycling, Chemical Recycling, etc.
    recovery_category = Column(String, nullable=True)       # Excellent, High, Moderate, Limited, Disposal

    # Preserved AI/CV diagnostic evidence
    damage_score = Column(Float, nullable=True)
    contamination_detected = Column(Boolean, nullable=True, default=False)
    confidence_score = Column(Float, nullable=True)
    structural_integrity = Column(Float, nullable=True)
    stain_risk = Column(Float, nullable=True)
    weave_pattern = Column(String, nullable=True)

    operator = relationship("User")

