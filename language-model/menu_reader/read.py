from common.client import GEMINI_API_CLIENT
from common.custom_types import ImageData, MenuData, make_invalid_menu
from .structurer import MenuStructurer, GeminiStructurer
from .ocr import ImageToTextParser
from .filter import filter_unique_images
from .merge import merge_menus
import typing
import asyncio
import logging

logger = logging.getLogger(__name__)
selected_structurer = GeminiStructurer(GEMINI_API_CLIENT)


async def _run_ocr(img: ImageData):
    parser = ImageToTextParser()
    ocr_text = await parser.detect_text(img)

    return ocr_text


async def read_menu_using_structurer(
    img: ImageData, structurer: MenuStructurer
) -> MenuData:
    ocr_text = await _run_ocr(img)

    if not ocr_text:
        return make_invalid_menu(
            "Failed to OCR the image. Likely the image byte data is malformed, or, possibly, contains no text."
        )

    return await structurer.structure(ocr_text, img)


async def read_menu(img: ImageData) -> MenuData:
    return await read_menu_using_structurer(img, selected_structurer)


async def read_menu_batch_with_structurer(
    images: typing.List[ImageData], structurer: MenuStructurer
) -> MenuData:

    # OCR all menu images
    ocr_tasks = [_run_ocr(image) for image in images]
    ocr_results = await asyncio.gather(*ocr_tasks)

    image_ocr_pairs = [
        (img, txt) for img, txt in zip(images, ocr_results) if img and txt is not None
    ]

    if len(image_ocr_pairs) == 0:
        return make_invalid_menu(
            "Failed to OCR all images. Likely the image byte data is malformed, or, possibly, contains no text."
        )

    # Filter all unique image/ocr text pairings
    unique_pairings = filter_unique_images(image_ocr_pairs)

    # Structure unique menus
    structure_tasks = [
        structurer.structure(text, image) for image, text in unique_pairings
    ]
    menus = await asyncio.gather(*structure_tasks)

    # Aggregate menus into one final menu
    return merge_menus(menus)


async def read_menu_batch(images: typing.List[ImageData]) -> MenuData:
    return await read_menu_batch_with_structurer(images, selected_structurer)
