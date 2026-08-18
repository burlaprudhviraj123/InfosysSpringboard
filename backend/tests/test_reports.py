import pytest

REPORT_TYPES = ["waste_classification", "recycling", "sustainability", "environmental_impact", "circular_economy"]

def test_reports_json_endpoints(client, manager_headers):
    for rt in REPORT_TYPES:
        res = client.get(f"/api/reports/data?report_type={rt}", headers=manager_headers)
        assert res.status_code == 200, f"Failed report {rt}: {res.text}"
        data = res.json()
        assert "summary" in data
        assert "records" in data
        assert data["report_type"] == rt

def test_reports_excel_export(client, manager_headers):
    for rt in REPORT_TYPES:
        res = client.get(f"/api/reports/export/excel?report_type={rt}", headers=manager_headers)
        assert res.status_code == 200
        assert res.headers["content-type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        assert len(res.content) > 500

def test_reports_csv_export(client, manager_headers):
    for rt in REPORT_TYPES:
        res = client.get(f"/api/reports/export/csv?report_type={rt}", headers=manager_headers)
        assert res.status_code == 200
        assert "text/csv" in res.headers["content-type"]
