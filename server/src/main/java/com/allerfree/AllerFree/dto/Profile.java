package com.allerfree.AllerFree.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class Profile {
    private String name;
    private Allergy[] allergens = {};

    public Profile(){
        name = "";
    }
}
