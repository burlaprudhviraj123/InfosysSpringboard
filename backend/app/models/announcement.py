from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class PlatformAnnouncement(Base):
    __tablename__ = "platform_announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    severity = Column(String, default="info", nullable=False)  # info, success, warning, urgent
    target_role = Column(String, default="ALL", nullable=False) # ALL, Recycling Facility Operator, Sustainability Manager, Textile Manufacturer, Administrator
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    creator = relationship("User")
