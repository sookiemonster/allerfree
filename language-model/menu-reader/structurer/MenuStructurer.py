from typing import List
from custom_types import MenuSection, ImageData
from abc import ABC, abstractmethod
from prompts import make_prompt


class MenuStructurer(ABC):
    TEMPLATE_FILE = "structure_menu.j2"

    def _get_prompt(self, unstructured_ocr_text: str) -> str:
        return make_prompt(MenuStructurer.TEMPLATE_FILE, unstructured_ocr_text=unstructured_ocr_text)

    @abstractmethod
    def structure(self, unstructured_ocr_text: str, img: ImageData) -> str:
        pass
