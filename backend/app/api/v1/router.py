from fastapi import APIRouter
from app.api.v1.health import router as health_router
from app.api.v1.plants import router as plants_router
from app.api.v1.tasks import router as tasks_router
from app.api.v1.journal import router as journal_router
from app.api.v1.uploads import router as uploads_router
from app.api.v1.seed import router as seed_router
from app.api.v1.doctor import router as doctor_router

api_router = APIRouter()

api_router.include_router(health_router, tags=["Health"])
api_router.include_router(plants_router, tags=["Plants"])
api_router.include_router(tasks_router, tags=["Care Tasks"])
api_router.include_router(journal_router, tags=["Growth Journal"])
api_router.include_router(uploads_router, tags=["Uploads & Media"])
api_router.include_router(seed_router, tags=["Demo Data"])
api_router.include_router(doctor_router, tags=["Plant Doctor AI"])
