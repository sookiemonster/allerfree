from common.client.GoogleClients import GEMINI_API_CLIENT
from typing import List
from common.custom_types import LabeledAllergenMenu, MenuData, SupportedAllergen
from .detectors import GeminiDetector

detector = GeminiDetector(GEMINI_API_CLIENT)


def detect_allergen(menu: MenuData, allergen: SupportedAllergen) -> LabeledAllergenMenu:
    return detector.detect_allergen(menu, allergen)


def detect_allergens(
    menu: MenuData, allergens: List[SupportedAllergen]
) -> LabeledAllergenMenu:
    raise Exception("Not implemented yet")
    return detector.detect_allergen(menu, allergens[0])
