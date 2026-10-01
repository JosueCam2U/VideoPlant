from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.video import Video
from app.models.comment import Comment
from app.models.user import User
from app.schemas.comment import CommentCreate, CommentOut
from app.services.auth import get_current_user


router = APIRouter(prefix="/videos/{video_id}/comments", tags=["Comentarios"])


@router.post("", response_model=CommentOut, status_code=status.HTTP_201_CREATED)
def create_comment(
    video_id: int,
    payload: CommentCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    if not db.get(Video, video_id):
        raise HTTPException(status_code=404, detail="Video no encontrado")

    comment = Comment(
        content=payload.content,
        user_id=current.id,
        video_id=video_id,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


@router.get("", response_model=list[CommentOut])
def list_comments(video_id: int, db: Session = Depends(get_db)):
    if not db.get(Video, video_id):
        raise HTTPException(status_code=404, detail="Video no encontrado")

    return (
        db.query(Comment)
        .options(joinedload(Comment.user))
        .filter(Comment.video_id == video_id)
        .order_by(Comment.created_at.desc())
        .all()
    )