package com.allerfree.AllerFree.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import com.allerfree.AllerFree.dto.Coordinate;
import com.allerfree.AllerFree.dto.Image;
import com.allerfree.AllerFree.dto.Profile;

@AllArgsConstructor
@Data
public class DetectionRequest {
    private String restaurantName;
    private Coordinate restaurantLocation;
    private List<Image> images;
    private HashMap<String, Profile> profiles;

    public DetectionRequest(){
        restaurantName = "";
        restaurantLocation = new Coordinate();
        images = new ArrayList<Image>();
        profiles = new HashMap<String, Profile>();
    }
}
