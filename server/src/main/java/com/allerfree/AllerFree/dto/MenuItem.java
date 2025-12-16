package com.allerfree.AllerFree.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@Data
public class MenuItem {
    private String name;
    private String description;
    private List<String> symbols;
    private List<AllergenPrediction> contains;

    public MenuItem(){
        name = "";
        description = "";
        symbols = new ArrayList<String>();
        contains = new ArrayList<AllergenPrediction>();
    }
}
