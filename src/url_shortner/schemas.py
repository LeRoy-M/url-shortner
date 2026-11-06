from datetime import datetime
from pydantic import BaseModel, HttpUrl, field_validator


class URLCreate(BaseModel):
    original_url: str

    @field_validator("original_url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        if not v.startswith(("http://", "https://")):
            raise ValueError("URL must start with http:// or https://")
        return v


class URLResponse(BaseModel):
    id: int
    original_url: str
    short_code: str
    short_url: str
    clicks: int
    created_at: datetime

    model_config = {"from_attributes": True}


class URLListResponse(BaseModel):
    urls: list[URLResponse]
    total: int
