import pytest
from app.models.announcement import PlatformAnnouncement

def test_automatic_notifications_feed(client, operator_headers):
    res = client.get("/api/notifications", headers=operator_headers)
    assert res.status_code == 200
    notifs = res.json()
    assert isinstance(notifs, list)

def test_admin_announcement_workflow(client, admin_headers, operator_headers, manager_headers):
    # 1. Non-admin is rejected
    non_admin_res = client.post("/api/notifications/announcements", json={
        "title": "Unauthorized Notice",
        "message": "This should fail",
        "severity": "info",
        "target_role": "ALL"
    }, headers=operator_headers)
    assert non_admin_res.status_code == 403

    # 2. Admin creates global announcement
    create_res = client.post("/api/notifications/announcements", json={
        "title": "System Audit Complete",
        "message": "Platform verified successfully across all modules.",
        "severity": "success",
        "target_role": "ALL"
    }, headers=admin_headers)
    assert create_res.status_code == 201
    announcement_id = create_res.json()["id"]

    # 3. Visible in operator notifications
    op_notifs = client.get("/api/notifications", headers=operator_headers).json()
    assert any(n["title"] == "System Audit Complete" for n in op_notifs)

    # 4. Admin creates role-targeted announcement for Manager only
    target_res = client.post("/api/notifications/announcements", json={
        "title": "Manager Protocol",
        "message": "Manager only message",
        "severity": "warning",
        "target_role": "Sustainability Manager"
    }, headers=admin_headers)
    target_id = target_res.json()["id"]

    # Manager sees it, Operator does NOT
    mgr_notifs = client.get("/api/notifications", headers=manager_headers).json()
    op_notifs_after = client.get("/api/notifications", headers=operator_headers).json()
    assert any(n["title"] == "Manager Protocol" for n in mgr_notifs)
    assert not any(n["title"] == "Manager Protocol" for n in op_notifs_after)

    # 5. Admin deletes announcement
    del_res = client.delete(f"/api/notifications/announcements/{announcement_id}", headers=admin_headers)
    assert del_res.status_code == 200

    # Clean up manager announcement
    client.delete(f"/api/notifications/announcements/{target_id}", headers=admin_headers)
