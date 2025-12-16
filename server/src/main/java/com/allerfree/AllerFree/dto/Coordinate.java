package com.allerfree.AllerFree.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Coordinate {
    private Double lat;
    private Double lng;

    public Coordinate(){
        lat = 0.0;
        lng = 0.0;
    }
}
