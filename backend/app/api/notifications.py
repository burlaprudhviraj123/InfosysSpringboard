from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from pydantic import BaseModel
from typing import Optional

from app.db.session import get_db
from app.api.auth import get_current_user
from app.models.user import User, UserRole
from app.models.waste import WasteBatch
from app.models.announcement import PlatformAnnouncement
from app.core.sustainability_config import (
    CO2_SAVINGS_FACTOR_KG_PER_KG,
    WATER_SAVINGS_FACTOR_L_PER_KG,
)

router = APIRouter()

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    user_role_str = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    if user_role_str != UserRole.ADMIN.value and user_role_str != "Administrator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required to manage announcements."
        )
    return current_user

class AnnouncementCreate(BaseModel):
    title: str
    message: str
    severity: str = "info" # info, success, warning, urgent
    target_role: str = "ALL" # ALL, Recycling Facility Operator, Sustainability Manager, Textile Manufacturer, Administrator

class AnnouncementResponse(BaseModel):
    id: int
    title: str
    message: str
    severity: str
    target_role: str
    created_at: datetime
    is_active: bool
    created_by_id: int
    author_username: Optional[str] = None

    class Config:
        from_attributes = True

def humanize_time(dt: datetime) -> str:
    if not dt:
        return "Recently"
    now = datetime.now(timezone.utc)
    if isinstance(dt, str):
        try:
            dt = datetime.fromisoformat(dt.replace("Z", "+00:00"))
        except Exception:
            return "Recently"
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    diff = now - dt
    seconds = int(diff.total_seconds())
    if seconds < 60:
        return "Just now"
    elif seconds < 3600:
        mins = max(1, seconds // 60)
        return f"{mins}m ago"
    elif seconds < 86400:
        hours = seconds // 3600
        return f"{hours}h ago"
    else:
        days = seconds // 86400
        return f"{days}d ago"

# -------------------------------------------------------------
# 1. Admin Management Endpoints for Platform Announcements
# -------------------------------------------------------------

@router.post("/announcements", response_model=AnnouncementResponse, status_code=status.HTTP_201_CREATED)
def create_announcement(
    payload: AnnouncementCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    if not payload.title.strip() or not payload.message.strip():
        raise HTTPException(status_code=400, detail="Title and message cannot be empty.")

    valid_severities = ["info", "success", "warning", "urgent"]
    if payload.severity not in valid_severities:
        payload.severity = "info"

    announcement = PlatformAnnouncement(
        title=payload.title.strip(),
        message=payload.message.strip(),
        severity=payload.severity,
        target_role=payload.target_role.strip(),
        created_by_id=admin_user.id,
        created_at=datetime.utcnow(),
        is_active=True
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)

    return AnnouncementResponse(
        id=announcement.id,
        title=announcement.title,
        message=announcement.message,
        severity=announcement.severity,
        target_role=announcement.target_role,
        created_at=announcement.created_at,
        is_active=announcement.is_active,
        created_by_id=announcement.created_by_id,
        author_username=admin_user.username
    )

@router.get("/announcements", response_model=list[AnnouncementResponse])
def list_announcements_for_admin(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    announcements = db.query(PlatformAnnouncement).order_by(PlatformAnnouncement.created_at.desc()).all()
    results = []
    for a in announcements:
        author_name = a.creator.username if a.creator else f"Admin #{a.created_by_id}"
        results.append(AnnouncementResponse(
            id=a.id,
            title=a.title,
            message=a.message,
            severity=a.severity,
            target_role=a.target_role,
            created_at=a.created_at,
            is_active=a.is_active,
            created_by_id=a.created_by_id,
            author_username=author_name
        ))
    return results

@router.delete("/announcements/{announcement_id}")
def delete_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin)
):
    announcement = db.query(PlatformAnnouncement).filter(PlatformAnnouncement.id == announcement_id).first()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found.")

    db.delete(announcement)
    db.commit()
    return {"message": "Announcement deleted successfully.", "id": announcement_id}

# -------------------------------------------------------------
# 2. Main Notification Feed for Authenticated Users
# -------------------------------------------------------------

@router.get("", response_model=list[dict])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate dynamic system notifications strictly derived from live database
    state, covering all 5 specification categories:
    1. Waste collection alerts (dynamic)
    2. Recycling opportunity notifications (dynamic)
    3. Sustainability milestone alerts (dynamic)
    4. Inventory warnings (dynamic)
    5. Platform announcements (persistent from Admin DB table, filtered by target role)
    """
    user_role_str = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    notifications = []
    notif_id = 1

    # 1. Platform Announcements from Database (Admin-Created & Role-Targeted)
    active_announcements = db.query(PlatformAnnouncement).filter(
        PlatformAnnouncement.is_active == True
    ).order_by(PlatformAnnouncement.created_at.desc()).all()

    for a in active_announcements:
        # Check target role visibility
        target = a.target_role
        is_visible = (
            target == "ALL"
            or target == user_role_str
            or user_role_str == "Administrator"
            or user_role_str == UserRole.ADMIN.value
        )
        if is_visible:
            notifications.append({
                "id": f"announcement-{a.id}",
                "category": "Platform Announcement",
                "type": "platform_announcement",
                "severity": a.severity,
                "title": a.title,
                "message": a.message,
                "timestamp": a.created_at.isoformat() if hasattr(a.created_at, "isoformat") else str(a.created_at),
                "time_ago": humanize_time(a.created_at),
                "unread": True,
                "batch_id": None
            })

    # Query active batches for automatic categories
    batches = db.query(WasteBatch).order_by(WasteBatch.id.desc()).all()

    if not batches:
        # Inventory Warning when zero batches exist
        notifications.append({
            "id": "warning-empty-ledger",
            "category": "Inventory Warning",
            "type": "inventory_warning",
            "severity": "warning",
            "title": "Empty Inventory Ledger",
            "message": "No active textile batches found in the facility ledger. Upload fabric photos to register incoming waste.",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "time_ago": "Just now",
            "unread": True,
            "batch_id": None
        })
        return notifications

    total_weight = sum(b.quantity for b in batches)
    total_co2 = total_weight * CO2_SAVINGS_FACTOR_KG_PER_KG
    total_water = total_weight * WATER_SAVINGS_FACTOR_L_PER_KG

    # 2. Sustainability Milestone Alert (From Live Throughput)
    latest_date = batches[0].collection_date if batches[0].collection_date else datetime.now(timezone.utc)
    notifications.append({
        "id": f"sustainability-target-{len(batches)}",
        "category": "Sustainability",
        "type": "sustainability",
        "severity": "success",
        "title": "Cumulative Diverted Waste Target",
        "message": f"Facility has diverted {total_weight:.1f} kg across {len(batches)} batches, avoiding {total_co2:.1f} kg CO2 and conserving {total_water:.0f} L water.",
        "timestamp": latest_date.isoformat() if hasattr(latest_date, "isoformat") else str(latest_date),
        "time_ago": humanize_time(latest_date),
        "unread": True,
        "batch_id": None
    })

    # 3. Waste Collection Alerts & Recycling Opportunities from Recent Batches
    for b in batches[:4]:
        c_dt = b.collection_date
        c_str = c_dt.strftime("%Y-%m-%d") if hasattr(c_dt, "strftime") else str(c_dt).split("T")[0]
        
        # Category 1: Waste Collection Alerts
        notifications.append({
            "id": f"collection-batch-{b.id}",
            "category": "Waste Collection",
            "type": "waste_collection",
            "severity": "info",
            "title": f"Collection Scheduled — Batch #{b.id}",
            "message": f"Intake of {b.quantity:.1f} kg ({b.fabric_type}, {b.color}) scheduled for collection on {c_str}.",
            "timestamp": c_dt.isoformat() if hasattr(c_dt, "isoformat") else str(c_dt),
            "time_ago": humanize_time(c_dt),
            "unread": True,
            "batch_id": b.id
        })

        # Category 2: Recycling Opportunity Notifications (High Circularity)
        if b.circularity_score and b.circularity_score >= 70.0:
            notifications.append({
                "id": f"opportunity-batch-{b.id}",
                "category": "Recycling Opportunity",
                "type": "recycling_opportunity",
                "severity": "success",
                "title": f"High Recovery Potential — {b.fabric_type}",
                "message": f"{b.quantity:.1f} kg of {b.fabric_type} qualifies for {b.recycling_recommendation} with a {b.circularity_score:.1f}% circularity rating.",
                "timestamp": c_dt.isoformat() if hasattr(c_dt, "isoformat") else str(c_dt),
                "time_ago": humanize_time(c_dt),
                "unread": True,
                "batch_id": b.id
            })

        # Category 4: Inventory Warnings (Hazardous / Contaminated or Damaged)
        if b.waste_category in ["Hazardous Textile Waste", "Hazardous", "Repairable"]:
            notifications.append({
                "id": f"warning-batch-{b.id}",
                "category": "Inventory Warning",
                "type": "inventory_warning",
                "severity": "urgent" if "Hazardous" in b.waste_category else "warning",
                "title": f"Material Warning — Batch #{b.id}",
                "message": f"Batch #{b.id} flagged as {b.waste_category}. Requires dedicated sorting and PPE handling.",
                "timestamp": c_dt.isoformat() if hasattr(c_dt, "isoformat") else str(c_dt),
                "time_ago": humanize_time(c_dt),
                "unread": True,
                "batch_id": b.id
            })

    return notifications
