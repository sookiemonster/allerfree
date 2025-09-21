from logging import getLogger
from abc import ABC, abstractmethod
from typing import Optional
from common.custom_types import MenuData, ImageData, make_invalid_menu
from common.prompts import make_prompt
import json

logger = getLogger(__name__)


class MenuStructurer(ABC):
    TEMPLATE_FILE = "structure_menu.j2"
    ERROR_KEY = "error"

    @classmethod
    def _get_menu_error(cls, json_dict: dict) -> Optional[str]:
        if MenuStructurer.ERROR_KEY not in json_dict.keys():
            return None

        logger.error(
            "Failed to structure menu with reason: %s",
            json_dict[MenuStructurer.ERROR_KEY],
        )

        return json_dict[MenuStructurer.ERROR_KEY]

    @classmethod
    def _to_menu_schema(cls, json_string: Optional[str]) -> MenuData:
        logger.debug("RECEIVED JSON STRING: \n %s", json_string)
        print(json_string)

        if not json_string:
            null_obj_received_message = "Received None for JSON string. Likely the structuring LLM errored during execution."
            logger.error(null_obj_received_message)
            return make_invalid_menu(null_obj_received_message)

        if not (json_dict := json.loads(json_string)):
            invalid_json_msg = "Did not receive a valid JSON format the structurer. Hallucination possibly?"
            logger.error(invalid_json_msg)
            return make_invalid_menu(invalid_json_msg)

        logger.debug("CONVERTED TO JSON_DICT:\n %s", json_dict)

        if err := MenuStructurer._get_menu_error(json_dict):
            return make_invalid_menu(err)

        return MenuData(**json_dict)

    def _get_prompt(self, unstructured_ocr_text: str) -> str:
        return make_prompt(
            MenuStructurer.TEMPLATE_FILE, unstructured_ocr_text=unstructured_ocr_text
        )

    @abstractmethod
    def structure(self, unstructured_ocr_text: str, img: ImageData) -> MenuData:
        pass
