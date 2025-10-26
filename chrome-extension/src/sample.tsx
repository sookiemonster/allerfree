export const SAMPLE_JSON = `
{
  "failed": {},
  "results": {
    "Thomas": {
      "sections": [
        {
          "section": "SIDES",
          "description": "",
          "items": [
            {
              "name": "CHIPS",
              "description": "",
              "symbols": [],
              "contains": [
                {
                  "allergen": "gluten",
                  "prediction": "MAY_CONTAIN",
                  "explanation": "While corn chips are typically gluten-free, they may be fried in a shared fryer with gluten-containing items, or seasoned with gluten-containing spices. Some corn tortillas also contain a small amount of wheat.",
                  "safe_to_eat": false
                },
                {
                  "allergen": "shellfish",
                  "prediction": "VERY_UNLIKELY",
                  "explanation": "This item consists of corn chips, which are naturally shellfish-free. There's no indication of hidden shellfish ingredients or cross-contamination risk.",
                  "safe_to_eat": true
                }
              ]
            },
            {
              "name": "AVOCADO FRIES",
              "description": "",
              "symbols": [],
              "contains": [
                {
                  "allergen": "gluten",
                  "prediction": "VERY_LIKELY",
                  "explanation": "Avocado fries are typically breaded or battered before frying, and breading/batter commonly contains wheat flour.",
                  "safe_to_eat": false
                },
                {
                  "allergen": "shellfish",
                  "prediction": "VERY_UNLIKELY",
                  "explanation": "Avocado fries are typically made from avocado, breading, and oil, none of which commonly contain shellfish. There's no indication of hidden shellfish ingredients or cross-contamination risk in this context.",
                  "safe_to_eat": true
                }
              ]
            },
            {
              "name": "FRIES' DIPPER",
              "description": "",
              "symbols": [],
              "contains": [
                {
                  "allergen": "gluten",
                  "prediction": "MAY_CONTAIN",
                  "explanation": "French fries are typically gluten-free, but they are often fried in shared fryers with gluten-containing items, leading to a high risk of cross-contamination.",
                  "safe_to_eat": false
                },
                {
                  "allergen": "shellfish",
                  "prediction": "VERY_UNLIKELY",
                  "explanation": "Given the general menu context (Mexican cuisine), a dip for fries is highly unlikely to contain shellfish. There's no specific description to suggest otherwise.",
                  "safe_to_eat": true
                }
              ]
            },
            {
              "name": "NACHO CHEESE FRIES",
              "description": "",
              "symbols": [],
              "contains": [
                {
                  "allergen": "gluten",
                  "prediction": "MAY_CONTAIN",
                  "explanation": "The fries component carries a risk of cross-contamination from shared fryers. Additionally, some processed cheese sauces might contain modified food starch derived from wheat.",
                  "safe_to_eat": false
                },
                {
                  "allergen": "shellfish",
                  "prediction": "VERY_UNLIKELY",
                  "explanation": "This dish consists of fries topped with nacho cheese, which are both naturally shellfish-free ingredients. There's no indication of hidden shellfish or cross-contamination.",
                  "safe_to_eat": true
                }
              ]
            },
            {
              "name": "TORTILLA ON SIDE",
              "description": "",
              "symbols": [],
              "contains": [
                {
                  "allergen": "gluten",
                  "prediction": "MAY_CONTAIN",
                  "explanation": "Tortillas can be made from corn (naturally gluten-free) or wheat (contains gluten). Without specification, it's ambiguous if wheat flour tortillas are an option or default. The Taco and Fajita kits specify 'Soft Corn Tortillas', suggesting 'Tortilla' alone might not be exclusively corn.",
                  "safe_to_eat": false
                },
                {
                  "allergen": "shellfish",
                  "prediction": "VERY_UNLIKELY",
                  "explanation": "Tortillas (corn or flour) are basic ingredients and are naturally shellfish-free. There's no indication of hidden shellfish ingredients or cross-contamination risk.",
                  "safe_to_eat": true
                }
              ]
            },
            {
              "name": "RICE AND BEANS",
              "description": "",
              "symbols": [],
              "contains": [
                {
                  "allergen": "gluten",
                  "prediction": "VERY_UNLIKELY",
                  "explanation": "Rice and beans are naturally gluten-free. Assuming plain preparation without gluten-containing sauces or broths, this is very unlikely to contain gluten.",
                  "safe_to_eat": true
                },
                {
                  "allergen": "shellfish",
                  "prediction": "VERY_UNLIKELY",
                  "explanation": "Rice and beans are staple ingredients and are naturally shellfish-free. In Mexican cuisine, they are not typically prepared with shellfish-derived products.",
                  "safe_to_eat": true
                }
              ]
            },
            {
              "name": "GUACAMOLE",
              "description": "",
              "symbols": [],
              "contains": [
                {
                  "allergen": "gluten",
                  "prediction": "VERY_UNLIKELY",
                  "explanation": "Guacamole, made from avocado, onions, cilantro, and lime, is naturally gluten-free.",
                  "safe_to_eat": true
                },
                {
                  "allergen": "shellfish",
                  "prediction": "VERY_UNLIKELY",
                  "explanation": "Guacamole is made from avocados, onions, cilantro, lime, and salt, which are all naturally shellfish-free. There's no indication of hidden shellfish ingredients.",
                  "safe_to_eat": true
                }
              ]
            },
            {
              "name": "QUESO",
              "description": "",
              "symbols": [],
              "contains": [
                {
                  "allergen": "gluten",
                  "prediction": "MAY_CONTAIN",
                  "explanation": "While cheese itself is gluten-free, processed queso sauces may contain modified food starch as a thickener, which can be derived from wheat.",
                  "safe_to_eat": false
                },
                {
                  "allergen": "shellfish",
                  "prediction": "VERY_UNLIKELY",
                  "explanation": "Queso (cheese dip) is a dairy-based product and is naturally shellfish-free. There's no indication of hidden shellfish ingredients.",
                  "safe_to_eat": true
                }
              ]
            },
            {
              "name": "SALSA",
              "description": "",
              "symbols": [],
              "contains": [
                {
                  "allergen": "gluten",
                  "prediction": "VERY_UNLIKELY",
                  "explanation": "Salsa, typically made from tomatoes, onions, peppers, and herbs, is naturally gluten-free.",
                  "safe_to_eat": true
                },
                {
                  "allergen": "shellfish",
                  "prediction": "VERY_UNLIKELY",
                  "explanation": "Salsa is typically made from tomatoes, onions, peppers, and cilantro, which are all naturally shellfish-free. There's no indication of hidden shellfish ingredients.",
                  "safe_to_eat": true
                }
              ]
            },
            {
              "name": "CHIPS & GUAC",
              "description": "",
              "symbols": [],
              "contains": [
                {
                  "allergen": "gluten",
                  "prediction": "MAY_CONTAIN",
                  "explanation": "Guacamole is gluten-free, but the chips carry a risk of cross-contamination from shared fryers or containing a small amount of wheat in some corn tortilla varieties.",
                  "safe_to_eat": false
                },
                {
                  "allergen": "shellfish",
                  "prediction": "VERY_UNLIKELY",
                  "explanation": "Both chips and guacamole are naturally shellfish-free ingredients in this context. There's no indication of hidden shellfish or cross-contamination.",
                  "safe_to_eat": true
                }
              ]
            },
            {
              "name": "CHIPS & QUESO",
              "description": "",
              "symbols": [],
              "contains": [
                {
                  "allergen": "gluten",
                  "prediction": "MAY_CONTAIN",
                  "explanation": "Both the chips (potential shared fryer/hidden wheat) and the queso (potential modified food starch) have ingredients that may contain or be cross-contaminated with gluten.",
                  "safe_to_eat": false
                },
                {
                  "allergen": "shellfish",
                  "prediction": "VERY_UNLIKELY",
                  "explanation": "Both chips and queso are naturally shellfish-free ingredients in this context. There's no indication of hidden shellfish or cross-contamination.",
                  "safe_to_eat": true
                }
              ]
            },
            {
              "name": "CHIPS & SALSA",
              "description": "",
              "symbols": [],
              "contains": [
                {
                  "allergen": "gluten",
                  "prediction": "MAY_CONTAIN",
                  "explanation": "Salsa is gluten-free, but the chips carry a risk of cross-contamination from shared fryers or containing a small amount of wheat in some corn tortilla varieties.",
                  "safe_to_eat": false
                },
                {
                  "allergen": "shellfish",
                  "prediction": "VERY_UNLIKELY",
                  "explanation": "Both chips and salsa are naturally shellfish-free ingredients in this context. There's no indication of hidden shellfish or cross-contamination.",
                  "safe_to_eat": true
                }
              ]
            }
          ]
        },
        {
          "section": "DESSERTS",
          "description": "",
          "items": []
        }
      ]
    },
    "Daniel": {
      "sections": [
        {
          "section": "SIDES",
          "description": "",
          "items": [
            {
              "name": "AWDWUIDJH",
              "description": "",
              "symbols": [],
              "contains": [
                {
                  "allergen": "gluten",
                  "prediction": "VERY_UNLIKELY",
                  "explanation": "While corn chips are typically gluten-free, they may be fried in a shared fryer with gluten-containing items, or seasoned with gluten-containing spices. Some corn tortillas also contain a small amount of wheat.",
                  "safe_to_eat": true
                },
                {
                  "allergen": "shellfish",
                  "prediction": "VERY_UNLIKELY",
                  "explanation": "This item consists of corn chips, which are naturally shellfish-free. There's no indication of hidden shellfish ingredients or cross-contamination risk.",
                  "safe_to_eat": true
                }
              ]
            },
            {
              "name": "AVOCADO FRIES",
              "description": "",
              "symbols": [],
              "contains": [
                {
                  "allergen": "gluten",
                  "prediction": "VERY_LIKELY",
                  "explanation": "Avocado fries are typically breaded or battered before frying, and breading/batter commonly contains wheat flour.",
                  "safe_to_eat": false
                },
                {
                  "allergen": "shellfish",
                  "prediction": "VERY_UNLIKELY",
                  "explanation": "Avocado fries are typically made from avocado, breading, and oil, none of which commonly contain shellfish. There's no indication of hidden shellfish ingredients or cross-contamination risk in this context.",
                  "safe_to_eat": true
                }
              ]
            },
            {
              "name": "FRIES' DIPPER",
              "description": "",
              "symbols": [],
              "contains": [
                {
                  "allergen": "gluten",
                  "prediction": "MAY_CONTAIN",
                  "explanation": "French fries are typically gluten-free, but they are often fried in shared fryers with gluten-containing items, leading to a high risk of cross-contamination.",
                  "safe_to_eat": false
                },
                {
                  "allergen": "shellfish",
                  "prediction": "VERY_UNLIKELY",
                  "explanation": "Given the general menu context (Mexican cuisine), a dip for fries is highly unlikely to contain shellfish. There's no specific description to suggest otherwise.",
                  "safe_to_eat": true
                }
              ]
            },
            {
              "name": "NACHO CHEESE FRIES",
              "description": "",
              "symbols": [],
              "contains": [
                {
                  "allergen": "gluten",
                  "prediction": "MAY_CONTAIN",
                  "explanation": "The fries component carries a risk of cross-contamination from shared fryers. Additionally, some processed cheese sauces might contain modified food starch derived from wheat.",
                  "safe_to_eat": false
                },
                {
                  "allergen": "shellfish",
                  "prediction": "VERY_UNLIKELY",
                  "explanation": "This dish consists of fries topped with nacho cheese, which are both naturally shellfish-free ingredients. There's no indication of hidden shellfish or cross-contamination.",
                  "safe_to_eat": true
                }
              ]
            },
            {
              "name": "TORTILLA ON SIDE",
              "description": "",
              "symbols": [],
              "contains": [
                {
                  "allergen": "gluten",
                  "prediction": "MAY_CONTAIN",
                  "explanation": "Tortillas can be made from corn (naturally gluten-free) or wheat (contains gluten). Without specification, it's ambiguous if wheat flour tortillas are an option or default. The Taco and Fajita kits specify 'Soft Corn Tortillas', suggesting 'Tortilla' alone might not be exclusively corn.",
                  "safe_to_eat": false
                },
                {
                  "allergen": "shellfish",
                  "prediction": "VERY_UNLIKELY",
                  "explanation": "Tortillas (corn or flour) are basic ingredients and are naturally shellfish-free. There's no indication of hidden shellfish ingredients or cross-contamination risk.",
                  "safe_to_eat": true
                }
              ]
            },
            {
              "name": "RICE AND BEANS",
              "description": "",
              "symbols": [],
              "contains": [
                {
                  "allergen": "gluten",
                  "prediction": "VERY_UNLIKELY",
                  "explanation": "Rice and beans are naturally gluten-free. Assuming plain preparation without gluten-containing sauces or broths, this is very unlikely to contain gluten.",
                  "safe_to_eat": true
                },
                {
                  "allergen": "shellfish",
                  "prediction": "VERY_UNLIKELY",
                  "explanation": "Rice and beans are staple ingredients and are naturally shellfish-free. In Mexican cuisine, they are not typically prepared with shellfish-derived products.",
                  "safe_to_eat": true
                }
              ]
            },
            {
              "name": "GUACAMOLE",
              "description": "",
              "symbols": [],
              "contains": [
                {
                  "allergen": "gluten",
                  "prediction": "VERY_UNLIKELY",
                  "explanation": "Guacamole, made from avocado, onions, cilantro, and lime, is naturally gluten-free.",
                  "safe_to_eat": true
                },
                {
                  "allergen": "shellfish",
                  "prediction": "VERY_UNLIKELY",
                  "explanation": "Guacamole is made from avocados, onions, cilantro, lime, and salt, which are all naturally shellfish-free. There's no indication of hidden shellfish ingredients.",
                  "safe_to_eat": true
                }
              ]
            },
            {
              "name": "QUESO",
              "description": "",
              "symbols": [],
              "contains": [
                {
                  "allergen": "gluten",
                  "prediction": "MAY_CONTAIN",
                  "explanation": "While cheese itself is gluten-free, processed queso sauces may contain modified food starch as a thickener, which can be derived from wheat.",
                  "safe_to_eat": false
                },
                {
                  "allergen": "shellfish",
                  "prediction": "VERY_UNLIKELY",
                  "explanation": "Queso (cheese dip) is a dairy-based product and is naturally shellfish-free. There's no indication of hidden shellfish ingredients.",
                  "safe_to_eat": true
                }
              ]
            },
            {
              "name": "SALSA",
              "description": "",
              "symbols": [],
              "contains": [
                {
                  "allergen": "gluten",
                  "prediction": "VERY_UNLIKELY",
                  "explanation": "Salsa, typically made from tomatoes, onions, peppers, and herbs, is naturally gluten-free.",
                  "safe_to_eat": true
                },
                {
                  "allergen": "shellfish",
                  "prediction": "VERY_UNLIKELY",
                  "explanation": "Salsa is typically made from tomatoes, onions, peppers, and cilantro, which are all naturally shellfish-free. There's no indication of hidden shellfish ingredients.",
                  "safe_to_eat": true
                }
              ]
            },
            {
              "name": "CHIPS & GUAC",
              "description": "",
              "symbols": [],
              "contains": [
                {
                  "allergen": "gluten",
                  "prediction": "MAY_CONTAIN",
                  "explanation": "Guacamole is gluten-free, but the chips carry a risk of cross-contamination from shared fryers or containing a small amount of wheat in some corn tortilla varieties.",
                  "safe_to_eat": false
                },
                {
                  "allergen": "shellfish",
                  "prediction": "VERY_UNLIKELY",
                  "explanation": "Both chips and guacamole are naturally shellfish-free ingredients in this context. There's no indication of hidden shellfish or cross-contamination.",
                  "safe_to_eat": true
                }
              ]
            },
            {
              "name": "CHIPS & QUESO",
              "description": "",
              "symbols": [],
              "contains": [
                {
                  "allergen": "gluten",
                  "prediction": "MAY_CONTAIN",
                  "explanation": "Both the chips (potential shared fryer/hidden wheat) and the queso (potential modified food starch) have ingredients that may contain or be cross-contaminated with gluten.",
                  "safe_to_eat": false
                },
                {
                  "allergen": "shellfish",
                  "prediction": "VERY_UNLIKELY",
                  "explanation": "Both chips and queso are naturally shellfish-free ingredients in this context. There's no indication of hidden shellfish or cross-contamination.",
                  "safe_to_eat": true
                }
              ]
            },
            {
              "name": "CHIPS & SALSA",
              "description": "",
              "symbols": [],
              "contains": [
                {
                  "allergen": "gluten",
                  "prediction": "MAY_CONTAIN",
                  "explanation": "Salsa is gluten-free, but the chips carry a risk of cross-contamination from shared fryers or containing a small amount of wheat in some corn tortilla varieties.",
                  "safe_to_eat": false
                },
                {
                  "allergen": "shellfish",
                  "prediction": "VERY_UNLIKELY",
                  "explanation": "Both chips and salsa are naturally shellfish-free ingredients in this context. There's no indication of hidden shellfish or cross-contamination.",
                  "safe_to_eat": true
                }
              ]
            }
          ]
        },
        {
          "section": "DESSERTS",
          "description": "",
          "items": []
        }
      ]
    }
  }
}
`;
