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
    allergens = list(menus.keys())
    agg_menu = menus.pop(allergens[0])

    if len(menus) == 0:
        return agg_menu

    for section in agg_menu.sections:
        for other_menu in menus.values():

            same_section = next(
                (s2 for s2 in other_menu.sections if s2.section == section.section),
                None,
            )

            if not same_section:
                continue

            for item in section.items:
                same_item = next(
                    (i for i in same_section.items if item.name == i.name), None
                )

                if not same_item or not same_item.contains:
                    continue

                item.contains = (item.contains or []) + same_item.contains

    return agg_menu
