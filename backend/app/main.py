from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.core.config import settings
from app.db.session import engine, Base
from app.api import auth, inventory, sustainability

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["authentication"])
app.include_router(inventory.router, prefix=f"{settings.API_V1_STR}/inventory", tags=["inventory"])
app.include_router(sustainability.router, prefix=f"{settings.API_V1_STR}/sustainability", tags=["sustainability"])

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the AI Textile Waste Intelligence Platform API",
        "docs_url": "/docs"
    }
