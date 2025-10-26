from common.custom_types import LabeledAllergenMenu, SupportedAllergen, AllergenPrediction
from typing import List, Optional
import pandas as pd

def find_prediction(contains: List[AllergenPrediction], allergen:SupportedAllergen) -> Optional[AllergenPrediction]:
    return next((x for x in contains if x.allergen == allergen), None)
    

def pair_expected_and_produced_items(expected:dict, produced:LabeledAllergenMenu):
    unexpected_items_produced = []
    expected_but_not_found_allergens = []
    results = []
    
    for section in produced.sections:
        for item in section.items:
            item_name = item.name.lower().strip()
            if item_name not in expected.keys():
                unexpected_items_produced.append(item)
                continue
                
            for contains_allergen, expected_prediction in expected[item_name].items():
                allergen = contains_allergen.replace("contains_", "")

                if not (produced_prediction := find_prediction(contains=item.contains, allergen=allergen)):
                    expected_but_not_found_allergens.append([item.contains, allergen])
                    continue
                
                results.append(
                    [item_name, allergen, produced_prediction.prediction, produced_prediction.explanation, expected_prediction]
                )
            
    return pd.DataFrame(results, columns=["Item Name", "Allergen Name", "Prediction", "Explanation", "Expected"])
