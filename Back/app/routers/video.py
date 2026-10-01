from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.config import settings
from app.database import get_db
from app.models.video import Video
from app.models.user import User
from app.models.comment import Comment                       
from app.schemas.video import VideoCreate, VideoUpdate, VideoOut, VideoDetail
from app.services.auth import get_current_user
from app.services.s3 import generate_presigned_upload


router = APIRouter(prefix="/videos", tags=["Videos"])


@router.post("/upload-url")
def get_upload_urls(
    kind: str,  # "video" | "thumbnail"
    content_type: str,
    current: User = Depends(get_current_user),
):
    """Genera URLs prefirmadas para subir video o miniatura directo a S3."""
    if kind == "video":
        if content_type != "video/mp4":
            raise HTTPException(status_code=400, detail="Solo se permite MP4")
        bucket = settings.S3_BUCKET_VIDEOS
        prefix = "videos"
    elif kind == "thumbnail":
        if content_type not in ("image/jpeg", "image/jpg", "image/png"):
            raise HTTPException(status_code=400, detail="Solo JPG/JPEG/PNG")
        bucket = settings.S3_BUCKET_THUMBNAILS
        prefix = "thumbnails"
    else:
        raise HTTPException(status_code=400, detail="kind inválido")

    return generate_presigned_upload(bucket, prefix, content_type)


@router.post("", response_model=VideoOut, status_code=status.HTTP_201_CREATED)
def create_video(
    payload: VideoCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    video = Video(
        title=payload.title,
        description=payload.description,
        video_url=str(payload.video_url),
        thumbnail_url=str(payload.thumbnail_url),
        user_id=current.id,
    )
    db.add(video)
    db.commit()
    db.refresh(video)
    return video


@router.get("", response_model=list[VideoOut])
def list_videos(db: Session = Depends(get_db)):
    return (
        db.query(Video)
        .options(joinedload(Video.owner))
        .order_by(Video.created_at.desc())
        .all()
    )


@router.get("/{id}", response_model=VideoDetail)
def get_video(id: int, db: Session = Depends(get_db)):
    video = (
        db.query(Video)
        .options(
            joinedload(Video.owner),
            joinedload(Video.comments).joinedload(Comment.user),   
        )
        .filter(Video.id == id)
        .first()
    )
    if not video:
        raise HTTPException(status_code=404, detail="Video no encontrado")

    video.views += 1
    db.commit()
    db.refresh(video)
    return video


@router.get("/{id}/recommended", response_model=list[VideoOut])
def recommended(id: int, db: Session = Depends(get_db), limit: int = 6):
    """Videos recomendados: excluye el actual, prioriza mismo autor y populares."""
    video = db.get(Video, id)
    if not video:
        raise HTTPException(status_code=404, detail="Video no encontrado")

    same_author = (
        db.query(Video)
        .options(joinedload(Video.owner))
        .filter(Video.id != id, Video.user_id == video.user_id)
        .order_by(Video.views.desc())
        .limit(limit)
        .all()
    )

    remaining = limit - len(same_author)
    if remaining > 0:
        ids = [v.id for v in same_author] + [id]
        others = (
            db.query(Video)
            .options(joinedload(Video.owner))
            .filter(~Video.id.in_(ids))
            .order_by(Video.views.desc())
            .limit(remaining)
            .all()
        )
        same_author.extend(others)

    return same_author


@router.put("/{id}", response_model=VideoOut)
def update_video(
    id: int,
    payload: VideoUpdate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    video = db.get(Video, id)
    if not video:
        raise HTTPException(status_code=404, detail="Video no encontrado")
    if video.user_id != current.id:
        raise HTTPException(status_code=403, detail="No autorizado")

    data = payload.model_dump(exclude_unset=True)
    if "thumbnail_url" in data and data["thumbnail_url"] is not None:
        data["thumbnail_url"] = str(data["thumbnail_url"])

    for field, value in data.items():
        setattr(video, field, value)

    db.commit()
    db.refresh(video)
    return video


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_video(
    id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    video = db.get(Video, id)
    if not video:
        raise HTTPException(status_code=404, detail="Video no encontrado")
    if video.user_id != current.id:
        raise HTTPException(status_code=403, detail="No autorizado")

    db.delete(video)
    db.commit()
    return None