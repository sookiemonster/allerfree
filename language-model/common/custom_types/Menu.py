from dataclasses import dataclass
from typing import List, Literal, Union, Tuple, Optional
from pydantic import BaseModel
from enum import StrEnum

INVALID_MENU_STRING = "!INVALID_MENU!"


class MenuSymbol(StrEnum):
    GF = "gluten-free"
    VGE = "vegetarian"
    VGA = "vegan"


@dataclass
class AllergenPrediction(BaseModel):
    allergen: str
    prediction: Literal["VERY_LIKELY", "MAY_CONTAIN", "VERY_UNLIKELY"]
    explanation: str


@dataclass
class MenuItem(BaseModel):
    name: str
    description: str
    symbols: List[str]
    contains: Optional[List[AllergenPrediction]] = None


@dataclass
class MenuSection(BaseModel):
    section: str
    description: str
    items: List[MenuItem]


@dataclass
class MenuData(BaseModel):
    sections: List[MenuSection]


@dataclass
class LabeledAllergenMenu(BaseModel):
    sections: List[MenuSection]


def make_invalid_menu(message: str = "") -> MenuData:
    return MenuData(
        sections=[
            MenuSection(section=INVALID_MENU_STRING, description=message, items=[])
        ]
    )


def make_invalid_labeled_menu(message: str = "") -> LabeledAllergenMenu:
    return LabeledAllergenMenu(
        sections=[
            MenuSection(section=INVALID_MENU_STRING, description=message, items=[])
        ]
    )


def is_invalid_menu(
    menu_data: Union[MenuData, LabeledAllergenMenu],
) -> Tuple[bool, str]:
    if len(menu_data.sections) == 0:
        return True, "No sections present in the menu object."

    if menu_data.sections[0].section == INVALID_MENU_STRING:
        return True, menu_data.sections[0].description

    return False, ""
