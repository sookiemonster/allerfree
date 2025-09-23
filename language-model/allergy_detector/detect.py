from common.client.GoogleClients import GEMINI_API_CLIENT
from common.custom_types import LabeledAllergenMenu, MenuData, SupportedAllergen
from .detectors import GeminiDetector

detector = GeminiDetector(GEMINI_API_CLIENT)


def detect_allergen(menu: MenuData, allergen: SupportedAllergen) -> LabeledAllergenMenu:
    return detector.detect_allergen(menu, allergen)
