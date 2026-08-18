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

def test_notification_read_persistence(client, operator_headers):
    # 1. Fetch initial feed
    res = client.get("/api/notifications", headers=operator_headers)
    assert res.status_code == 200
    notifs = res.json()
    assert len(notifs) > 0
    first_id = notifs[0]["id"]

    # 2. Mark first notification as read
    read_res = client.post(f"/api/notifications/{first_id}/read", headers=operator_headers)
    assert read_res.status_code == 200
    assert read_res.json()["unread"] == False

    # 3. Reload feed and verify unread is False
    res_after = client.get("/api/notifications", headers=operator_headers)
    notifs_after = res_after.json()
    first_after = next(n for n in notifs_after if n["id"] == first_id)
    assert first_after["unread"] == False

    # 4. Mark all as read
    read_all_res = client.post("/api/notifications/read-all", json={}, headers=operator_headers)
    assert read_all_res.status_code == 200

    # 5. Reload feed and verify all are marked read
    res_final = client.get("/api/notifications", headers=operator_headers)
    for n in res_final.json():
        assert n["unread"] == False
