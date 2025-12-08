package com.allerfree.AllerFree.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AllergenDetection {
    private String restaurantName;
    private String restaurantLocation;
    private List<Image> images;
    private HashMap<String, Profile> profiles;
}
