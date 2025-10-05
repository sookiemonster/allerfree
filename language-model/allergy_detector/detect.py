from common.client.GoogleClients import GEMINI_API_CLIENT
from typing import List, Dict
from common.custom_types import LabeledAllergenMenu, MenuData, SupportedAllergen
from .detectors import GeminiDetector
import asyncio

detector = GeminiDetector(GEMINI_API_CLIENT)


async def detect_allergen(
    menu: MenuData, allergen: SupportedAllergen
) -> LabeledAllergenMenu:
    return await detector.detect_allergen(menu, allergen)


async def detect_allergens(
    menu: MenuData, allergens: List[SupportedAllergen]
) -> Dict[SupportedAllergen, LabeledAllergenMenu]:
    async with asyncio.TaskGroup() as group:
        tasks = {
            allergen: group.create_task(detect_allergen(menu=menu, allergen=allergen))
            for allergen in allergens
        }

    return {allergen: task.result() for allergen, task in tasks.items()}


def aggregate_allergies(
    menus: Dict[SupportedAllergen, LabeledAllergenMenu],
) -> LabeledAllergenMenu:
    raise Exception("not implemented yet")
    # allergens = menus.keys()
