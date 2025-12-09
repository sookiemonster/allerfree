import typing
from common.custom_types import MenuData, MenuSection, make_invalid_menu


def merge_menus(
    menus: typing.List[MenuData],
) -> MenuData:
    """
    Merges a list of MenuData objects into a single MenuData object.
    - Combines sections with the same name (case-insensitive).
    - Merges items within sections, keeping the first occurrence of unique items.
    """
    if not menus:
        # Return an empty MenuData if input is empty
        return make_invalid_menu(
            "No menus were supplied to merge. Did the structuring fail?"
        )

    merged_sections_map: typing.Dict[str, MenuSection] = {}

    for menu in menus:
        for section in menu.sections:
            # Normalize section name to handle "Entrees" vs "ENTREES "
            section_key = section.section.strip().lower()

            if section_key not in merged_sections_map:
                # If this is a new section, add it to our map.
                merged_sections_map[section_key] = section.model_copy(deep=True)
                continue

            # If section exists, merge the NEW items into the EXISTING section
            existing_section = merged_sections_map[section_key]
            existing_item_names = {
                item.name.strip().lower() for item in existing_section.items
            }

            for item in section.items:
                item_name_norm = item.name.strip().lower()

                # Only append if we haven't seen this item in this section yet
                if item_name_norm not in existing_item_names:
                    existing_section.items.append(item)
                    existing_item_names.add(item_name_norm)

            # Optional: If the existing section had a blank description
            # but the new one has text, upgrade it.
            if not existing_section.description and section.description:
                existing_section.description = section.description

    # Convert the values of our map back into a list
    return MenuData(sections=list(merged_sections_map.values()))
