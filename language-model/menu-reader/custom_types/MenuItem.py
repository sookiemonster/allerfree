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
    descrption: str
    symbols: List[MenuSymbol]
