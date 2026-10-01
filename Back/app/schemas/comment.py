from datetime import datetime
from pydantic import BaseModel, Field

from app.schemas.user import UserOut


class CommentCreate(BaseModel):
    content: str = Field(min_length=1, max_length=1000)


class CommentOut(BaseModel):
    id: int
    content: str
    created_at: datetime
    user: UserOut

    model_config = {"from_attributes": True}