# 🧵 TexWaste.ai — AI-Driven Textile Waste Intelligence Platform

[![Build & Tests](https://img.shields.io/badge/CI%2FCD-Passing%20(24%2F24%20Tests)-brightgreen?style=for-the-badge&logo=githubactions)](https://github.com/springboardmentor27300a/Textile-Waste-Intelligence-Platform-Group-1)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.12-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![PyTorch](https://img.shields.io/badge/Deep%20Learning-PyTorch%20%7C%20EfficientNet--B0-EE4C2C?style=for-the-badge&logo=pytorch)](https://pytorch.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2016-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Containerization-Docker%20Compose-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![Azure](https://img.shields.io/badge/Cloud%20Host-Microsoft%20Azure%20VM-0078D4?style=for-the-badge&logo=microsoftazure)](http://texwaste-ai.centralindia.cloudapp.azure.com)

> **Infosys Springboard Industry Project — Group 1**  
> An enterprise-grade, end-to-end cloud platform for automated industrial textile waste identification, multi-spectral damage assessment, 5-factor circularity scoring, and closed-loop material recycling routing.

---

## 📌 Live Cloud Deployment
* **Live Web Application**: [http://texwaste-ai.centralindia.cloudapp.azure.com](http://texwaste-ai.centralindia.cloudapp.azure.com) *(or `http://20.219.16.80`)*

---

## 📖 Executive Summary & Problem Context
India generates over **7.8 million metric tons** of textile waste annually. Over 85% of pre-consumer factory offcuts and post-consumer apparel end up in landfills or open incinerators due to a lack of automated sorting intelligence, fiber composition uncertainty, and inefficient recycling channel matching.

**TexWaste.ai** solves this industry challenge by combining **Deep Learning Computer Vision** with **ISO 14040/14044 Life Cycle Assessment (LCA)** and real-time **Indian scrap economics (₹ INR)** to convert unstructured textile waste into certified, high-value circular feedstock.

---

## 🌟 Key Platform Capabilities

### 1. 🔬 Deep Learning & Computer Vision Inference Engine
* **PyTorch Deep Classifier (EfficientNet-B0)**: Classifies fabric samples across **10 industrial material classes** (*Cotton, Denim, Wool, Silk, Linen, Polyester, Nylon, Rayon, Acrylic, Mixed Fabrics*) in under **40 milliseconds**.
* **OpenCV Optical Diagnostics**:
  * **HSV Dominant Color Extraction**: Determines primary and secondary hex colors, dye saturation, and color fastness.
  * **Laplacian Edge Damage Analysis**: Quantifies structural degradation, edge fraying, and fiber pilling.
  * **Contamination Risk Masking**: Detects surface grease, oil, chemical spills, and stain dispersion.
  * **Weave Pattern & Thread Density (TPI)**: Recognizes plain weave, twill, satin, knit, and composite matrices.

### 2. 🧮 5-Factor Weighted Circularity Scoring Algorithm
Implements the exact multi-dimensional sensitivity formula aligned with sustainability standards:
$$\text{Circularity Score} = 0.35(R) + 0.20(C) + 0.20(U) + 0.15(E) + 0.10(F)$$

Where:
* **$R$ (Recyclability Index)**: Intrinsic fiber molecular suitability for mechanical/chemical closed loops (45%–90%).
* **$C$ (Condition Rating)**: Human & CV confirmed physical integrity (New: 95%, Good: 85%, Fair: 65%, Poor: 40%, Damaged: 20%).
* **$U$ (Direct Reuse Potential)**: Feasibility of direct upcycling or second-life garment repurposing.
* **$E$ (Environmental Benefit Factor)**: Avoided carbon and water footprints based on natural vs synthetic base.
* **$F$ (Processing Feasibility)**: Presence of elastane blends, contaminants, or synthetic coatings.

### 3. 🇮🇳 Indian Textile Scrap Yard Economics (₹ INR)
* Direct integration of real-world Indian wholesale textile scrap rates:
  * **Cotton/Denim Offcuts**: ₹18.50 – ₹25.00 / kg
  * **Polyester/Synthetic Filaments**: ₹10.00 – ₹14.50 / kg
  * **Mixed Blend Shoddy Fiber**: ₹6.00 – ₹8.50 / kg
* Calculates real-time factory cost recovery and landfill tipping fees spared.

### 4. 📊 Custom Interactive SVG Analytics Suite
* **5-Axis Spider Radar Polygon**: Multi-dimensional visualizer for the 5 circularity factors.
* **Cubic-Bezier Area Trend Curves**: Telemetry tracking sorted tonnage over time.
* **Landfill Diversion Speedometer Gauge**: Circular economy progress meter.
* **Dynamic Donut Breakdown**: Material composition mass distribution.

### 5. 📑 Enterprise Reporting & Notifications
* **Multi-Format Exports**: 1-click generation of **3-Sheet Excel Workbooks (`.xlsx`)**, **Raw CSV Streams (`.csv`)**, and **Certified PDF Audit Dossiers (`.pdf`)**.
* **PostgreSQL Persistent Notifications**: Real-time broadcast alerts on batch creation with read/unread persistence.
* **Dual-Scope Operator Shift Console**: Instant switching between personal shift batches and plant-wide facility analytics.

---

## 👥 Role-Based Access Control (RBAC) & Demo Credentials

| Role Persona | Target User | Capabilities | Demo Username | Demo Password |
| :--- | :--- | :--- | :--- | :--- |
| **Recycling Facility Operator** | Sorting Line Operators | Real-time camera scans, AI classification, sorting bin assignment, personal shift log. | `operator1` | `password123` |
| **Sustainability Manager** | ESG & Compliance Officers | Facility LCA reports, CO₂/Water offset metrics, circularity radar, environmental audit exports. | `sustainability_mgr` | `password123` |
| **Textile Manufacturer** | Apparel Brand Sourcing | Production offcut telemetry, scrap value recovery in ₹ INR, circular feedstock procurement. | `manufacturer1` | `password123` |
| **System Administrator** | Platform Governors | User lifecycle management, role elevation, batch deletion, microservices telemetry. | `admin` | `admin123` |

*Google OAuth2 Single Sign-On (SSO) and Secure Password Reset with SMTP OTP are fully integrated for all accounts.*

---

## 🏆 Infosys Springboard Milestone Compliance

| Milestone | Deliverables & Specification | Implementation Status |
| :---: | :--- | :---: |
| **Milestone 1** | Requirement Analysis, 4 User Personas, Entity Architecture (PostgreSQL Schema, Waste Batches, Users, Announcements). | **100% COMPLETE** |
| **Milestone 2** | Core Backend (FastAPI, JWT Auth, Google OAuth2, Password Reset with SMTP OTP, REST APIs, 24 Pytest Tests). | **100% COMPLETE** |
| **Milestone 3** | Deep Learning & Computer Vision (PyTorch EfficientNet-B0, OpenCV Feature Extraction, 5-Factor Circularity Algorithm). | **100% COMPLETE** |
| **Milestone 4** | Frontend Development (React 18 SPA, SVG Visualizer Suite, Docker Multi-Container Orchestration, Azure VM Deployment, CI/CD). | **100% COMPLETE** |

---

## 🏗️ Architecture & Technology Stack

```
                                  ┌────────────────────────┐
                                  │   Browser / Client     │
                                  │  (React 18 + Vite SPA) │
                                  └───────────┬────────────┘
                                              │ HTTP / Port 80 & 5173
                                  ┌───────────▼────────────┐
                                  │   Nginx Reverse Proxy  │
                                  │  (/ -> React Build)    │
                                  │  (/api/ -> FastAPI)    │
                                  │  (/static/ -> Uploads) │
                                  └───────────┬────────────┘
                                              │ Port 8000
                                  ┌───────────▼────────────┐
                                  │  FastAPI Backend (Py312│
                                  │  - JWT & RBAC Auth     │
                                  │  - PyTorch DL Model    │
                                  │  - OpenCV CV Pipeline  │
                                  └───────────┬────────────┘
                                              │ Port 5432
                                  ┌───────────▼────────────┐
                                  │  PostgreSQL 16 Engine  │
                                  │  (Docker Persistent)   │
                                  └────────────────────────┘
```

* **Frontend**: React 18, Vite, Custom Pure CSS Glassmorphism Design System, Custom SVG Multi-Chart Suite, `html2pdf.js`, `xlsx`.
* **Backend**: FastAPI, Python 3.12, Uvicorn, Pydantic V2, SQLAlchemy, Passlib (bcrypt), PyJWT.
* **AI / ML**: PyTorch 2.2+, Torchvision, EfficientNet-B0 Transfer Learning, OpenCV (`cv2`), NumPy, Scikit-learn.
* **Database**: PostgreSQL 16 Alpine with connection pooling and automated healthchecks.
* **DevOps**: Docker, Docker Compose, GitHub Actions CI/CD, Microsoft Azure B1s Linux VM.

---

## 📁 Repository Structure

```
├── .github/
│   └── workflows/
│       └── deploy.yml               # Automated 2-Stage CI/CD Pipeline
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py              # JWT, Google OAuth2, SMTP OTP
│   │   │   ├── classifier.py        # PyTorch Neural Classifier
│   │   │   ├── image_processing.py  # OpenCV Optical Analysis
│   │   │   ├── inventory.py         # Batch Intake & Management
│   │   │   ├── sustainability.py    # Circularity & LCA Engine
│   │   │   ├── materials.py         # 10-Material Taxonomy
│   │   │   ├── notifications.py     # Persistent Announcements
│   │   │   └── admin.py             # User Management & Governance
│   │   ├── models/                  # SQLAlchemy Relational Models
│   │   ├── db/                      # Session & Database Config
│   │   └── main.py                  # FastAPI Application Entry
│   ├── tests/                       # 24 Pytest Automated Test Suite
│   ├── static/uploads/              # Uploaded Fabric Assets Volume
│   ├── requirements.txt             # Python Backend Dependencies
│   └── Dockerfile                   # Multi-stage Backend Container
├── frontend/
│   ├── src/
│   │   ├── App.jsx                  # Main SPA Application & Chart Suite
│   │   ├── index.css                # Custom Glassmorphism Theme
│   │   └── main.jsx                 # React Entry Point
│   ├── public/                      # Static Favicon & Brand Assets
│   ├── nginx.conf                   # Production Nginx Reverse Proxy
│   ├── package.json                 # Frontend Dependencies
│   └── Dockerfile                   # Multi-stage Node/Nginx Container
├── ml/
│   ├── models/
│   │   └── textile_classifier.pth   # Trained Model Weights (~16MB)
│   └── scripts/
│       └── seed_50_batches.py       # Real AI Validation Batch Seeder
├── docker-compose.yml               # Full Stack Microservices Compose
├── .env.example                     # Environment Configuration Template
└── README.md                        # Master Documentation
```

---

## 🚀 Quick Start: Running Locally

### Option A: Running with Docker Compose (Recommended)

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/springboardmentor27300a/Textile-Waste-Intelligence-Platform-Group-1.git
   cd Textile-Waste-Intelligence-Platform-Group-1
   ```

2. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```

3. **Launch All Services**:
   ```bash
   docker compose up --build -d
   ```

4. **Access the Application**:
   * Frontend: `http://localhost:5173` (or `http://localhost`)
   * Backend Swagger API: `http://localhost:8000/docs`

---

### Option B: Running Manually (Without Docker)

#### 1. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

---

## 🧪 Running the Automated Test Suite (24/24 Tests Passing)

The project includes a comprehensive test suite covering Authentication, RBAC, Inventory Management, Sustainability LCA Calculations, and AI Image Analysis.

```bash
cd backend
pytest tests/ -v
```

**Test Coverage Summary**:
* ✅ `tests/test_auth.py` — Login, Token Verification, OTP Password Reset, RBAC Role Updates.
* ✅ `tests/test_inventory.py` — Batch Creation, Listing, Image Attachment, Deletion.
* ✅ `tests/test_sustainability.py` — 5-Factor Circularity Sensitivity Formula, LCA Offset Rates.
* ✅ `tests/test_materials.py` — Taxonomy Verification, Material Search.
* ✅ `tests/test_notifications.py` — Announcement Delivery, Mark Read Persistence.

---

## ☁️ Continuous Integration & Deployment (CI/CD)

Our **GitHub Actions Workflow** (`.github/workflows/deploy.yml`) guarantees continuous delivery:
1. **Stage 1 (CI)**: Spins up PostgreSQL 16, executes all **24 Pytest unit tests**, and builds the React Vite production bundle.
2. **Stage 2 (CD)**: Automatically connects to the **Azure Virtual Machine via SSH**, pulls the latest changes, and runs zero-downtime `docker compose up --build -d`.

---

## 🛡️ License
This project was developed for the **Infosys Springboard Internship Program** under the guidance of our project mentor.  
Licensed under the [MIT License](LICENSE).
