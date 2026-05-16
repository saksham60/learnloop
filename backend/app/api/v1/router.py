from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.agents.routes import router as agents_router
from app.api.v1.auth.routes import router as auth_router
from app.api.v1.content.routes import router as content_router
from app.api.v1.focus.routes import router as focus_router
from app.api.v1.growth.routes import router as growth_router
from app.api.v1.health.routes import router as health_router
from app.api.v1.homework.routes import router as homework_router
from app.api.v1.learning.routes import router as learning_router
from app.api.v1.progress.routes import router as progress_router
from app.api.v1.students.routes import router as students_router
from app.api.v1.teachers.routes import router as teachers_router

router = APIRouter(prefix="/api/v1")
router.include_router(health_router)
router.include_router(auth_router)
router.include_router(students_router)
router.include_router(learning_router)
router.include_router(homework_router)
router.include_router(progress_router)
router.include_router(focus_router)
router.include_router(teachers_router)
router.include_router(content_router)
router.include_router(growth_router)
router.include_router(agents_router)

