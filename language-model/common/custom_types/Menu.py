from dataclasses import dataclass
from typing import List, Literal
from enum import StrEnum


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
    return MenuData(sections=[MenuSection("INVALID_MENU", message, [])])


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
