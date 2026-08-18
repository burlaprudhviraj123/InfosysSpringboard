from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.core.config import settings
from app.db.session import engine, Base
from app.models import user, waste, announcement
from app.api import auth, inventory, sustainability, notifications, reports

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Textile Waste Intelligence Platform API",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Mount static files directory
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "static")
os.makedirs(STATIC_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# CORS configuration
origins = [
    "http://localhost:5173", # Vite local server
    "http://127.0.0.1:5173",
    "http://localhost:3000", # Next.js/React standard
    "*"                      # Allow all for testing
]

import logging
import time
from fastapi import Request

# Setup production logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("textile_platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.perf_counter()
    path = request.url.path
    method = request.method
    
    try:
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start_time) * 1000
        if not path.startswith("/static"):
            logger.info(f"{method} {path} - Status: {response.status_code} ({duration_ms:.2f}ms)")
        return response
    except Exception as e:
        duration_ms = (time.perf_counter() - start_time) * 1000
        logger.error(f"{method} {path} - FAILED ({duration_ms:.2f}ms): {e}")
        raise e

# Include Routers with both v1 and base prefixes for complete compatibility
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["authentication"])
app.include_router(inventory.router, prefix=f"{settings.API_V1_STR}/inventory", tags=["inventory"])
app.include_router(sustainability.router, prefix=f"{settings.API_V1_STR}/sustainability", tags=["sustainability"])
app.include_router(notifications.router, prefix=f"{settings.API_V1_STR}/notifications", tags=["notifications"])
app.include_router(reports.router, prefix=f"{settings.API_V1_STR}/reports", tags=["reports"])

app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(inventory.router, prefix="/api/inventory", tags=["inventory"])
app.include_router(sustainability.router, prefix="/api/sustainability", tags=["sustainability"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the AI Textile Waste Intelligence Platform API",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "service": "fastapi"
    }

