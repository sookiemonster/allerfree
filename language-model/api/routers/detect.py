from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Union, Dict
from common.custom_types import (
    LabeledAllergenMenu,
    SupportedAllergen,
    ImageData,
    is_invalid_menu,
    MenuData,
)
from menu_reader import read_menu
from allergy_detector import detect_allergens, aggregate_allergies
import logging

logger = logging.getLogger(__name__)


class MenuRequest(BaseModel):
    allergies: List[SupportedAllergen]
    image: ImageData


class MenuResponse(BaseModel):
    menus: Dict[SupportedAllergen, LabeledAllergenMenu]


router = APIRouter(
    prefix="/detect",
    responses={404: {"description": "Not found"}},
)


def validate_request_content(request: MenuRequest) -> None:
    return
    raise HTTPException(status_code=404, detail="Error!")


def validate_menu_stage(menu_data: Union[MenuData, LabeledAllergenMenu]) -> None:

    is_invalid, reason = is_invalid_menu(menu_data)

    if is_invalid:
        raise HTTPException(status_code=400, detail=reason)


@router.post("/menu_image/", tags=["detection"])
async def menu_image(
    request: MenuRequest,
) -> LabeledAllergenMenu:
    logger.info("Received request ", request)
    validate_request_content(request)

    ocr_menu = await read_menu(request.image)
    validate_menu_stage(ocr_menu)

    labeled_menus = await detect_allergens(menu=ocr_menu, allergens=request.allergies)

    for menu in labeled_menus.values():
        validate_menu_stage(menu)

    return aggregate_allergies(labeled_menus)
