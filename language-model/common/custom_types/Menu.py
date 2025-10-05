from dataclasses import dataclass
from typing import List, Literal, Union, Tuple
from enum import StrEnum

INVALID_MENU_STRING = "!INVALID_MENU!"


class MenuSymbol(StrEnum):
    GF = "gluten-free"
    VGE = "vegetarian"
    VGA = "vegan"


@dataclass
class MenuItem:
    name: str
    description: str
    symbols: List[str]


@dataclass
class MenuSection:
    section: str
    description: str
    items: List[MenuItem]


@dataclass
class MenuData:
    sections: List[MenuSection]


def make_invalid_menu(message: str = "") -> MenuData:
    return MenuData(sections=[MenuSection(INVALID_MENU_STRING, message, [])])


@dataclass
class AllergenPrediction:
    allergen_name: str
    prediction: Literal["VERY_LIKELY", "MAY_CONTAIN", "VERY_UNLIKELY"]
    explanation: str


@dataclass
class AllergenMenuSection(MenuSection):
    contains: List[AllergenPrediction]


@dataclass
class LabeledAllergenMenu:
    sections: List[AllergenMenuSection]


def make_invalid_labeled_menu(message: str = "") -> LabeledAllergenMenu:
    return LabeledAllergenMenu(
        sections=[AllergenMenuSection(INVALID_MENU_STRING, message, [], [])]
    )


def is_invalid_menu(
    menu_data: Union[MenuData, LabeledAllergenMenu],
) -> Tuple[bool, str]:
    if len(menu_data.sections) == 0:
        return True, "No sections present in the menu object."

    if menu_data.sections[0].section == INVALID_MENU_STRING:
        return True, menu_data.sections[0].description

    return False, ""
