from datetime import datetime
from pydantic import BaseModel, Field, HttpUrl

from app.schemas.user import UserOut
from app.schemas.comment import CommentOut


class VideoCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = ""
    video_url: HttpUrl
    thumbnail_url: HttpUrl


class VideoUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=200)
    description: str | None = None
    thumbnail_url: HttpUrl | None = None


class VideoOut(BaseModel):
    id: int
    title: str
    description: str
    video_url: str
    thumbnail_url: str
    views: int
    created_at: datetime
    user_id: int
    owner: UserOut

    model_config = {"from_attributes": True}


class VideoDetail(VideoOut):
    comments: list[CommentOut] = []