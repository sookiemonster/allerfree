from typing import List
from custom_types import MenuItem, ImageData
import jinja2


class MenuStructurer:
    TEMPLATE_FILE = "structure_menu.j2"

    def __init__(self) -> None:
        pass

    def _load_prompt_template(self) -> jinja2.Template:
        templateLoader = jinja2.FileSystemLoader(searchpath="./prompts")
        templateEnv = jinja2.Environment(loader=templateLoader)
        return templateEnv.get_template(MenuStructurer.TEMPLATE_FILE)

    def _make_prompt(self, ocr_text: str) -> str:
        return self._load_prompt_template().render(ocr_text=ocr_text)

    def structure(self, unstructured_ocr_text: str, img: ImageData) -> List[MenuItem]:
        prompt = self._make_prompt(unstructured_ocr_text)
        print(prompt)

        return []
