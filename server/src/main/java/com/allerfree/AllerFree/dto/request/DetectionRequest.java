package com.allerfree.AllerFree.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.List;

import com.allerfree.AllerFree.dto.Image;
import com.allerfree.AllerFree.dto.Profile;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class DetectionRequest {
    private String restaurantName;
    private String restaurantLocation;
    private List<Image> images;
    private HashMap<String, Profile> profiles;
}
