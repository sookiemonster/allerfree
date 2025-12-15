package com.allerfree.AllerFree.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class AllergenPrediction {
    private String allergen;
    private String prediction;
    private String explanation;
    private boolean safe_to_eat;

    public AllergenPrediction(){
        allergen = "";
        prediction = "";
        explanation = "";
        safe_to_eat = false;
    }
}
