package com.allerfree.AllerFree.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class Allergy {
    private String sensitivity;
    private String allergen;

    public Allergy(){
        sensitivity = "";
        allergen = "";
    }
}
