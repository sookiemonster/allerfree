from common.custom_types import MenuData, MenuSection, MenuItem
import typing


def merge_structured_menus(menus: typing.List[MenuData]) -> MenuData:
    """
    Merges a collection of different menus (or those containing overlapping information)
    into a single final menu.
    """
    result = MenuData(sections=[])

    def _items_to_dict(items: typing.List[MenuItem]):
        return {
            item.name: {
                "description": item.description,
                "symbols": item.symbols,
            }
            for item in items
        }

    def _sections_to_dict(sections: typing.List[MenuSection]):
        return {
            s.section: {"description": s.description, "items": _items_to_dict(s.items)}
            for s in sections
        }

    # def _merge_sections(sections: typing.List[typing.Dict]):
    #     """
    #     Merges sections that correspond to the same name.
    #     """

    #     res = {}
