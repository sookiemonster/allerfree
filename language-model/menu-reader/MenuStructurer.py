from typing import List
from custom_types import MenuSection, ImageData
from google.genai import types, Client
import jinja2


class MenuStructurer:
    TEMPLATE_FILE = "structure_menu.j2"
    LLM_MODEL = "gemini-2.5-flash"

    def __init__(self, gemini_client: Client) -> None:
        self.gemini_client = gemini_client

    def _load_prompt_template(self) -> jinja2.Template:
        templateLoader = jinja2.FileSystemLoader(searchpath="./prompts")
        templateEnv = jinja2.Environment(loader=templateLoader)
        return templateEnv.get_template(MenuStructurer.TEMPLATE_FILE)

    def _make_prompt(self, ocr_text: str) -> str:
        return self._load_prompt_template().render(ocr_text=ocr_text)

    def structure(self, unstructured_ocr_text: str, img: ImageData) -> str | None:
        # -> List[MenuItem]:
        prompt = self._make_prompt(unstructured_ocr_text)

        image_param = types.Part.from_bytes(data=img.base64, mime_type=img.mime_type)
        response = self.gemini_client.models.generate_content(
            model=MenuStructurer.LLM_MODEL,
            contents=[prompt, image_param],
            config=types.GenerateContentConfig(
                # Turn on dynamic thinking:
                thinking_config=types.ThinkingConfig(thinking_budget=1024),
                response_mime_type="application/json",
                response_schema=list[MenuSection],
            ),
        )

        return response.text
