from dataclasses import dataclass
from typing import List
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


INVALID_MENU = MenuData([])
