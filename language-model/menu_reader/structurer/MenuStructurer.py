from logging import getLogger
from abc import ABC, abstractmethod
from typing import Optional
from common.custom_types import MenuData, ImageData, INVALID_MENU
from common.prompts import make_prompt
import json

logger = getLogger(__name__)


class MenuStructurer(ABC):
    TEMPLATE_FILE = "structure_menu.j2"
    ERROR_KEY = "error"

    @classmethod
    def _is_not_restaurant_menu(cls, json_dict: dict) -> bool:
        if MenuStructurer.ERROR_KEY not in json_dict.keys():
            return False

        logger.error(
            "Failed to structure menu with reason: ",
            json_dict[MenuStructurer.ERROR_KEY],
        )
        return True

    @classmethod
    def _to_menu_schema(cls, json_string: Optional[str]) -> MenuData:
        logger.debug("RECEIVED JSON STRING", json_string)
        print(json_string)

        if not json_string:
            logger.error(
                "Received NONE for JSON string when trying to convert to menu schema. Is this actually a menu?"
            )
            return INVALID_MENU

        if not (json_dict := json.loads(json_string)):
            logger.error(
                "Did not receive a JSON string from the structurer. Is the image invalid or something?"
            )
            return INVALID_MENU

        logger.debug("CONVERTED TO JSON_DICT", json_dict)

        if MenuStructurer._is_not_restaurant_menu(json_dict):
            return INVALID_MENU

        return MenuData(**json_dict)

    def _get_prompt(self, unstructured_ocr_text: str) -> str:
        return make_prompt(
            MenuStructurer.TEMPLATE_FILE, unstructured_ocr_text=unstructured_ocr_text
        )

    @abstractmethod
    def structure(self, unstructured_ocr_text: str, img: ImageData) -> MenuData:
        pass
