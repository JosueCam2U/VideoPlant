from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app import models  # noqa: F401  (registra las tablas)
from app.routers import users, videos, comments


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Crea tablas al arrancar (en producción se puede migrar con Alembic)
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Plataforma de Videos API",
    version="1.0.0",
    description="API para la plataforma de videos (React + FastAPI + AWS)",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(videos.router)
app.include_router(comments.router)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "docs": "/docs"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}