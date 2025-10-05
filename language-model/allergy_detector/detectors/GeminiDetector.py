from .Detector import Detector
from google.genai import types, Client
from common.custom_types import (
    MenuData,
    LabeledAllergenMenu,
    SupportedAllergen,
)
from logging import getLogger

logger = getLogger(__name__)


class GeminiDetector(Detector):
    SELECTED_MODEL = "gemini-2.5-flash"

    def __init__(self, gemini_client: Client) -> None:
        self.gemini_client = gemini_client

    async def detect_allergen(
        self,
        menu: MenuData,
        allergen: SupportedAllergen,
    ) -> LabeledAllergenMenu:
        prompt = await self._get_prompt(menu, allergen)

        logger.info("Attempting to check %s with prompt: \n%s", allergen, prompt)

        response = await self.gemini_client.aio.models.generate_content(
            model=GeminiDetector.SELECTED_MODEL,
            contents=[prompt],
            config=types.GenerateContentConfig(
                thinking_config=types.ThinkingConfig(thinking_budget=1024),
                response_mime_type="application/json",
            ),
        )

        return Detector._to_menu_schema(response.text)
