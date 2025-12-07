from .Detector import Detector
from google.genai import types, Client
from common.custom_types import (
    MenuData,
    LabeledAllergenMenu,
    SupportedAllergen,
)
import common.log
import uuid


class GeminiDetector(Detector):
    SELECTED_MODEL = "gemini-2.5-flash"

    def __init__(self, gemini_client: Client) -> None:
        self.gemini_client = gemini_client

    async def detect_allergen(
        self,
        menu: MenuData,
        allergen: SupportedAllergen,
        identifier: str = str(uuid.uuid4()),
    ) -> LabeledAllergenMenu:
        prompt = await self._get_prompt(menu, allergen)

        logger = common.log.get_logger(f"{__name__}", identifier)
        logger.info("Attempting to check %s with prompt: \n%s", allergen, prompt)

        response = await self.gemini_client.aio.models.generate_content(
            model=GeminiDetector.SELECTED_MODEL,
            contents=[prompt],
            config=types.GenerateContentConfig(
                thinking_config=types.ThinkingConfig(thinking_budget=1024),
                response_mime_type="application/json",
            ),
        )

        logger.debug(f"START RESPONSE TEXT\n{response.text}\nEND RESPONSE TEXT")
        labeled_menu = Detector._to_menu_schema(response.text)
        logger.debug(f"LABELED MENU: {labeled_menu}")

        return labeled_menu
