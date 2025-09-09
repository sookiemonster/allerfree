from typing import List
from custom_types import MenuItem, ImageData

# import jinja2


class MenuStructurer:

    def __init__(self) -> None:
        pass

    # def _load_prompt(self):

    #     templateLoader = jinja2.FileSystemLoader(searchpath="./")
    #     templateEnv = jinja2.Environment(loader=templateLoader)
    #     TEMPLATE_FILE = "template.html"

    def structure(self, unstructured_ocr_text: str, img: ImageData) -> List[MenuItem]:
        return []
