package com.allerfree.AllerFree.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AllergenPrediction {
    private String allergen;
    private String prediction;
    private String explanation;
}
