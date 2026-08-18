# AI Textile Waste Intelligence Platform — Technical Documentation

## 1. System Architecture

The **AI Textile Waste Intelligence Platform** is an enterprise-grade sustainability intelligence system designed to automate textile sorting, estimate environmental recovery metrics, compute circular economy indices, and manage role-based industrial recycling workflows.

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT LAYER                                      |
|  React 18 + Vite SPA | Responsive Dashboards | Notification Center | PDF/Excel    |
+-----------------------------------------+-----------------------------------------+
                                          | HTTP / REST (JWT)
+-----------------------------------------v-----------------------------------------+
|                                 GATEWAY / PROXY                                   |
|  Nginx (Gzip, Reverse Proxy, Static Asset Caching, /api/ & /static/ Routing)      |
+-----------------------------------------+-----------------------------------------+
                                          |
+-----------------------------------------v-----------------------------------------+
|                               APPLICATION LAYER                                   |
|  FastAPI (Python 3.12) | Uvicorn ASGI Server | RBAC Middleware | Request Logger  |
|                                                                                   |
|  [Auth & JWT]    [Inventory Router]   [Sustainability API]   [Reports & Exports]  |
+--------------------+--------------------+--------------------+--------------------+
                     |                    |                    |
        +------------v-----------+        |         +----------v-----------+
        |  PyTorch Deep Learning |        |         | Database Engine      |
        |  EfficientNet-B0 (MPS) |        |         | PostgreSQL / SQLite  |
        |  10-Class Fabric Model |        |         | SQLAlchemy 2.0 ORM   |
        +------------------------+        |         +----------------------+
                     |                    |
        +------------v--------------------v--------------------+
        |  Computer Vision & Diagnostic Analysis Engine        |
        |  Color & Hue | Weave Pattern | Thread Density | Stain |
        +------------------------------------------------------+
```

---

## 2. Technology Stack

* **Frontend**: React 18, Vite 8, Vanilla CSS Design System, Canvas API, html2pdf.js, Lucide Icons.
* **Backend**: FastAPI 0.111, Uvicorn, Python 3.12, Pydantic v2, Python-Jose (JWT), Bcrypt 4.1.
* **Machine Learning & Computer Vision**: PyTorch 2.3 (Transfer Learning with EfficientNet-B0), Torchvision, OpenCV Headless 4.9, Pillow 10.3, NumPy, Scikit-Learn.
* **Data Processing & Export**: Pandas 2.2, OpenPyXL 3.1.5 (multi-sheet Excel generation).
* **Database & ORM**: SQLAlchemy 2.0, PostgreSQL 16 (production container) / SQLite (local testing).
* **Testing & Quality Assurance**: Pytest 9.1, HTTPX, FastAPI TestClient.
* **Containerization & Deployment**: Docker, Docker Compose, Nginx Alpine Multi-Stage Builds.

---

## 3. Database Architecture & Schemas

### `users` Table
* `id` (`Integer`, PK): Unique user identifier.
* `username` (`String`, Unique): User display name / handle.
* `email` (`String`, Unique, Indexed): User email address.
* `hashed_password` (`String`): Bcrypt salted password hash.
* `role` (`Enum`): `Recycling Facility Operator`, `Sustainability Manager`, `Textile Manufacturer`, `Administrator`.
* `organization_name` (`String`, Optional): Affiliated enterprise / plant name.

### `waste_batches` Table
* `id` (`Integer`, PK): Unique batch ledger serial.
* `fabric_type` (`String`): Material classification (`Cotton`, `Denim`, `Nylon`, `Polyester`, etc.).
* `source` (`String`): Intake origin (e.g. factory offcut, post-consumer sorting).
* `quantity` (`Float`): Batch weight in kilograms (kg).
* `color` (`String`): Primary visual color spectrum.
* `condition` (`String`): Quality state (`New`, `Good`, `Fair`, `Poor`, `Damaged`).
* `collection_date` (`DateTime`): Scheduled / completed logistics pickup date.
* `operator_id` (`Integer`, FK -> `users.id`): Creator/operator identity.
* `circularity_score` (`Float`): 5-Factor circular economy rating (0–100%).
* `waste_category` (`String`): Recovery destination (`Recyclable`, `Reusable`, `Upcyclable`, `Compostable`).
* `recycling_recommendation` (`String`): Operational directive (`Mechanical Shredding`, `Chemical Recovery`, `Fabric Reuse`, `Upcycling`).
* `recovery_category` (`String`): Tier rating (`Excellent`, `High`, `Moderate`, `Limited`, `Disposal`).
* `image_path` (`String`): Static URI to uploaded diagnostic textile photograph.

### `platform_announcements` Table
* `id` (`Integer`, PK): Announcement ID.
* `title` (`String`): Broadcast notice title.
* `message` (`String`): Broadcast body text.
* `severity` (`String`): `info`, `success`, `warning`, `urgent`.
* `target_role` (`String`): `ALL`, `Recycling Facility Operator`, `Sustainability Manager`, `Textile Manufacturer`, `Administrator`.
* `created_by_id` (`Integer`, FK -> `users.id`): Authoring administrator ID.
* `created_at` (`DateTime`): Publication timestamp (UTC).
* `is_active` (`Boolean`): Active display state flag.

---

## 4. Authentication & Role-Based Access Control (RBAC)

1. **Password Security**: Passwords are hashed using bcrypt with salt rounds. Plaintext credentials are never persisted or logged.
2. **JWT Authentication**: Stateless HS256 tokens carrying `sub` (subject username) and `exp` claims. Expired and malformed tokens are rejected with `401 Unauthorized`.
3. **Role Hierarchy**:
   - **Administrator**: Full access to all endpoints, user management directory (`GET /api/auth/users`), announcement publishing/deletion, and batch deletion.
   - **Recycling Facility Operator**: Image AI analysis, batch registration (`POST /api/inventory/batches`), batch retrieval, own batch deletion.
   - **Sustainability Manager**: Life Cycle Assessment (LCA) ESG carbon accounting, circularity scoring, executive report generation, export center.
   - **Textile Manufacturer**: Production offcut tracking, recovered feedstock cost savings, recycled yarn yield analytics.

---

## 5. Machine Learning & Computer Vision Pipeline

### Model Architecture
* **Base Backbone**: EfficientNet-B0 pre-trained on ImageNet.
* **Classification Head**: Dropout ($p=0.3$) followed by a Linear layer mapping 1280 features to 10 textile output classes.
* **Taxonomy (10 Classes)**: Acrylic, Cotton, Denim, Linen, Mixed Fabrics, Nylon, Polyester, Rayon (Viscose), Silk, Wool.
* **Hardware Acceleration**: Automatic runtime detection selecting Apple Silicon MPS -> NVIDIA CUDA -> CPU.

### Computer Vision Diagnostics
* **Dominant Color Extraction**: K-Means clustering and HSV/RGB color spectrum mapping.
* **Texture & Weave Pattern**: Laplacian variance, Gray-Level Co-occurrence Matrix (GLCM), and Sobel edge energy detection.
* **Structural Integrity & Damage**: Discontinuity contour mapping and surface wear scoring.
* **Contamination Risk**: Localized stain variance and discoloration density analysis.

### Evaluation Metrics (Held-Out Test Set — 984 Test Images across 10 Classes)
* **Overall Top-1 Test Accuracy**: 72.0%
* **Macro Recall**: 77.6%
* **Weighted F1-Score**: 0.721
* **Average Inference Latency**: ~36.6 ms per image (MPS hardware acceleration)

---

## 6. Circularity Scoring & Sustainability Formulas

### 5-Factor Weighted Circularity Formula (Section 9 Specification)
$$\text{Circularity Score} = 0.35(R) + 0.20(C) + 0.20(U) + 0.15(E) + 0.10(F)$$
* $R$ = Material Recyclability (0–100)
* $C$ = Physical Condition (0–100)
* $U$ = Reuse / Upcycling Potential (0–100)
* $E$ = Avoided Environmental Impact (0–100)
* $F$ = Industrial Processing Feasibility (0–100)

### Environmental Life Cycle Assessment (LCA) Constants
* **Carbon Offset Factor**: $3.6\text{ kg CO}_2\text{-eq}$ saved per kg textile waste diverted.
* **Water Conservation Factor**: $250.0\text{ Liters}$ saved per kg textile waste diverted.
* **Landfill Space Spared**: $0.0035\text{ m}^3$ avoided volume per kg compressed textile waste.
* **Feedstock Value**: $\$3.50\text{ USD}$ recovered value per kg sorted textile waste.
* **Industry Baseline Diversion**: $68.5\%$ benchmark.

---

## 7. Reports & Export System (Section 12 Specification)

The platform provides 5 specialized report types:
1. **Waste Classification Report**: Material breakdown, model confidence, blend distributions, and structural integrity.
2. **Recycling & Recovery Report**: Sorting bin allocations, mechanical & chemical processing routes, and reuse potential.
3. **Sustainability & ESG Report**: Certified carbon footprint offsets, water conservation, and global baseline benchmarking.
4. **Environmental Impact Assessment**: Landfill volume footprint avoided, feedstock market valuations, and resource protection.
5. **Circular Economy Analytics**: 5-factor circularity scoring, material quality grades, and circular loop efficiency.

### Export Formats
* **Excel Workbook (`.xlsx`)**: Generated dynamically via `openpyxl` with multi-sheet formatting (`Executive Summary`, `Batch Ledger`, `Material Breakdown`).
* **CSV Data Stream (`.csv`)**: Raw structured inventory ledger stream with RFC 4180 headers.
* **PDF Printable Report (`.pdf`)**: Formatted executive report with certified audit header.

---

## 8. Automated Test Suite & Verification Results

* **Pytest Test Suite**: `backend/tests/` (22 automated test cases)
  - `test_auth.py`: 8 tests (Registration, Login, Bcrypt hashing, Valid JWT, Invalid JWT, Expired JWT, Unauthorized 401, Admin RBAC 403).
  - `test_inventory.py`: 2 tests (Batch creation 201, Batch retrieval 200, Delete RBAC 204/403).
  - `test_ai_analysis.py`: 1 test (Inference, 10-class taxonomy, probabilities, non-persisting validation).
  - `test_circularity.py`: 3 tests (Formula verification, category boundaries, API endpoint).
  - `test_sustainability.py`: 3 tests (Zero-state behavior, live dynamic DB calculation, manufacturer analytics).
  - `test_notifications.py`: 2 tests (Automatic notifications, Admin announcement creation, role-filtering, deletion).
  - `test_reports.py`: 3 tests (5 JSON report types, 5 Excel exports, 5 CSV exports).
* **Result**: **22 / 22 Tests Passed (100% Pass Rate)** in 7.05s.

---

## 9. Performance Benchmark Results

Measured across 10 sample iterations per endpoint under active FastAPI runtime:

| Endpoint / Operation | Samples | Min Latency | Avg Latency | Max Latency | PDF Target | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **API Root / Health** (`/`) | 10 | 0.68 ms | 0.74 ms | 0.83 ms | < 50 ms | **PASS** |
| **User Profile Auth** (`/api/auth/me`) | 10 | 1.31 ms | 1.41 ms | 1.59 ms | < 50 ms | **PASS** |
| **Batch Inventory Retrieval** (`/api/inventory/batches`) | 10 | 1.50 ms | 1.62 ms | 2.22 ms | < 100 ms | **PASS** |
| **Sustainability ESG Metrics** (`/api/sustainability/metrics`) | 10 | 2.19 ms | 2.31 ms | 2.56 ms | < 100 ms | **PASS** |
| **Notification Center Feed** (`/api/notifications`) | 10 | 1.68 ms | 1.88 ms | 2.63 ms | < 100 ms | **PASS** |
| **Reports JSON Analytics** (`/api/reports/data`) | 10 | 1.57 ms | 1.63 ms | 1.69 ms | < 100 ms | **PASS** |
| **Reports Excel Export** (`/api/reports/export/excel`) | 10 | 8.82 ms | 9.23 ms | 10.06 ms | < 200 ms | **PASS** |
| **ML PyTorch + CV Pipeline** (`/api/inventory/analyze`) | 5 | 34.29 ms | 36.59 ms | 38.83 ms | < 500 ms | **PASS** |

---

## 10. Docker Containerization & Deployment Architecture

### Service Manifest (`docker-compose.yml`)
1. **`postgres` (PostgreSQL 16 Alpine)**: Persistent data storage with volume `postgres_data` and healthcheck `pg_isready`.
2. **`backend` (FastAPI + PyTorch CPU)**: Containerized with Python 3.12, OpenCV headless, PyTorch CPU, model volume `./ml/models:/app/ml/models:ro`, and static upload volume `backend_uploads`.
3. **`frontend` (React + Nginx)**: Multi-stage build (Node.js 20 build -> Nginx Alpine server) serving static assets with gzip compression and reverse proxying `/api/` and `/static/` to the backend container.

### Deployment Instructions
```bash
# 1. Clone repository and navigate to project root
git clone <repo-url>
cd "Infosys Spring Board"

# 2. Configure environment variables
cp .env.example .env

# 3. Build and launch all services via Docker Compose
docker compose up --build -d

# 4. Access the platform
# Frontend SPA: http://localhost:5173
# FastAPI Swagger Docs: http://localhost:8000/docs
# PostgreSQL Database: localhost:5432
```

---

## 11. Operating Notes

1. **Docker Container Execution**: Fully validated and verified using multi-container Docker Compose (`textile_postgres`, `textile_backend`, `textile_frontend`). All health checks, volume bindings, Nginx reverse proxy routes, and database connections pass without warnings.
2. **OAuth Local Testing**: Google OAuth login uses the configured Google Client ID in `.env`. Standard email/password authentication and role switching function independently of external OAuth providers.
