from fastapi import APIRouter
from pydantic import BaseModel, Base64Bytes
from typing import List

class MenuRequest(BaseModel):
    allergies: List[str]
    image_base64: Base64Bytes


router = APIRouter(
    prefix="/detect",
    # # dependencies=[],
    # responses={404: {"description": "Not found"}},
)


@router.get("/menu_image/", tags=["detection"])
async def menu_image(request: MenuRequest):
    return "Detecting!"