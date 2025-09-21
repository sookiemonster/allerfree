from common.client import GEMINI_API_CLIENT
from common.custom_types import ImageData, MenuData, make_invalid_menu
from .structurer import MenuStructurer, GeminiStructurer
from .ocr import ImageToTextParser

selected_structurer = GeminiStructurer(GEMINI_API_CLIENT)


def read_menu_using_structurer(img: ImageData, structurer: MenuStructurer) -> MenuData:
    parser = ImageToTextParser()
    ocr_text = parser.detect_text(img)

    if not ocr_text:
        return make_invalid_menu(
            "Failed to OCR the image. Likely the image byte data is malformed, or, possibly, contains no text."
        )

    menu_data = structurer.structure(ocr_text, img)
    return menu_data


def read_menu(img: ImageData) -> MenuData:
    return read_menu_using_structurer(img, selected_structurer)
