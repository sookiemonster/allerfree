from pydantic import BaseModel, Base64Bytes

# from dataclasses import dataclass
from enum import StrEnum


class SupportedMimeType(StrEnum):
    JPEG = "image/jpeg"
    PNG = "image/png"
    WEBP = "image/webp"


class ImageData(BaseModel):
    base64: Base64Bytes
    mime_type: SupportedMimeType
