from google.genai import types, Client
from custom_types import MenuSection, ImageData
from typing import List
from logging import getLogger
from structurer import MenuStructurer

logger = getLogger(__name__)

class GeminiStructurer(MenuStructurer):
    SELECTED_MODEL = "gemini-2.5-flash"
    
    def __init__(self, gemini_client: Client) -> None:
        self.gemini_client = gemini_client
    
    def structure(self, unstructured_ocr_text: str, img: ImageData) -> str:
        prompt = self._get_prompt(unstructured_ocr_text)

        logger.info("Attempting to structure OCR with prompt: \n", prompt)

        image_param = types.Part.from_bytes(data=img.base64, mime_type=img.mime_type)
        response = self.gemini_client.models.generate_content(
            model=GeminiStructurer.SELECTED_MODEL,
            contents=[prompt, image_param],
            config=types.GenerateContentConfig(
                thinking_config=types.ThinkingConfig(thinking_budget=1024),
                response_mime_type="application/json",
                response_schema=list[MenuSection],
            ),
        )

        return response.text
