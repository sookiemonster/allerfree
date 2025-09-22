from abc import ABC, abstractmethod
from typing import Optional
from google.genai import types, Client
from common.custom_types import (
    MenuData,
    LabeledAllergenMenu,
    SupportedAllergen,
)
from json import dumps
from dataclasses import asdict
from common.prompts import make_prompt
from logging import getLogger

logger = getLogger(__name__)


class Detector(ABC):

    @staticmethod
    def _to_menu_schema(allergen_menu_str: Optional[str]) -> LabeledAllergenMenu:
        return LabeledAllergenMenu([])

    @staticmethod
    def _menu_to_str(menu: MenuData) -> str:
        return str(dumps(asdict(menu)))

    @classmethod
    def _get_prompt(cls, menu: MenuData) -> str:
        return make_prompt(
            cls._get_template_filename(), menu_data_str=Detector._menu_to_str(menu)
        )

    @classmethod
    @abstractmethod
    def _get_template_filename(cls) -> str:
        pass

    @abstractmethod
    def detect_allergen(
        self, menu: MenuData, allergen: SupportedAllergen
    ) -> LabeledAllergenMenu:
        pass


class GeminiDetector(Detector, ABC):
    SELECTED_MODEL = "gemini-2.5-flash"

    def __init__(self, gemini_client: Client) -> None:
        self.gemini_client = gemini_client

    def detect_allergen(
        self, menu: MenuData, allergen: SupportedAllergen
    ) -> LabeledAllergenMenu:
        prompt = self._get_prompt(menu)

        logger.info("Attempting to check %s with prompt: \n%s", allergen, prompt)

        response = self.gemini_client.models.generate_content(
            model=GeminiDetector.SELECTED_MODEL,
            contents=[prompt],
            config=types.GenerateContentConfig(
                thinking_config=types.ThinkingConfig(thinking_budget=1024),
                response_mime_type="application/json",
                # response_schema=MenuData,
            ),
        )

        return Detector._to_menu_schema(response.text)
