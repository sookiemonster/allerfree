from logging import getLogger
from abc import ABC, abstractmethod
from typing import Optional
from common.custom_types import MenuData, ImageData, INVALID_MENU
from common.prompts import make_prompt
import json

logger = getLogger(__name__)


class MenuStructurer(ABC):
    TEMPLATE_FILE = "structure_menu.j2"

    @classmethod
    def _to_menu_schema(cls, json_string: Optional[str]) -> MenuData:
        if not json_string:
            logger.error(
                "Received NONE for JSON string when trying to convert to menu schema. Is this actually a menu?"
            )
            return INVALID_MENU

        json_dict = json.loads(json_string)
        return MenuData(**json_dict)

    def _get_prompt(self, unstructured_ocr_text: str) -> str:
        return make_prompt(
            MenuStructurer.TEMPLATE_FILE, unstructured_ocr_text=unstructured_ocr_text
        )

    @abstractmethod
    def structure(self, unstructured_ocr_text: str, img: ImageData) -> MenuData:
        pass
