from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.db.session import engine, Base, SessionLocal
from app.db.seed_data import seed_demo_data
from app.api.v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize database tables
    Base.metadata.create_all(bind=engine)

    # 2. Ensure storage path exists
    settings.upload_path.mkdir(parents=True, exist_ok=True)

    # 3. Seed initial demonstration botanical records if database is fresh
    with SessionLocal() as db:
        seed_demo_data(db=db, force=False)

    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent botanical companion API powering plant management, care planning, and growth tracking.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# CORS Middleware for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    """Root metadata response with documentation links."""
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs",
        "health_url": f"{settings.API_V1_STR}/health",
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Fallback error handler to avoid leaking internal tracebacks."""
    # If it's an HTTPException, FastAPI handles it natively;
    # this catches unhandled runtime errors.
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "message": "An unexpected server error occurred. Please verify backend logs.",
            "path": str(request.url),
        },
    )
