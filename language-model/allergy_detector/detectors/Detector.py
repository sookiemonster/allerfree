from abc import ABC, abstractmethod
from typing import Optional
from common.custom_types import (
    MenuData,
    LabeledAllergenMenu,
    SupportedAllergen,
    from_string,
    make_invalid_labeled_menu,
)
from json import dumps
from dataclasses import asdict
from common.prompts import make_prompt
from logging import getLogger

logger = getLogger(__name__)


class Detector(ABC):

    @staticmethod
    def _to_menu_schema(allergen_menu_str: Optional[str]) -> LabeledAllergenMenu:
        parse_result = from_string(allergen_menu_str)
        if not parse_result.did_succeed:
            return make_invalid_labeled_menu(
                parse_result.error or "(failed without explaining...)"
            )

        json_dict = parse_result.json_dict

        if "sections" not in json_dict.keys():
            return make_invalid_labeled_menu(
                "Received malformed labeled menu data object"
            )

        return LabeledAllergenMenu(**json_dict)

    @staticmethod
    def _menu_to_str(menu: MenuData) -> str:
        return str(dumps(asdict(menu)))

    @classmethod
    def _get_template_filename(cls, allergen: SupportedAllergen) -> str:
        match allergen:
            case SupportedAllergen.GLUTEN:
                return "detect_gluten.j2"
            case SupportedAllergen.SHELLFISH:
                return "detect_shellfish.j2"
            case _:
                raise Exception("Unhandled allergen.")

    @classmethod
    async def _get_prompt(cls, menu: MenuData, allergen: SupportedAllergen) -> str:
        return await make_prompt(
            cls._get_template_filename(allergen),
            menu_data_str=Detector._menu_to_str(menu),
        )

    @abstractmethod
    async def detect_allergen(
        self, menu: MenuData, allergen: SupportedAllergen
    ) -> LabeledAllergenMenu:
        pass
