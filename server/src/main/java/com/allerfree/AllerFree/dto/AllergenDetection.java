package com.allerfree.AllerFree.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AllergenDetection {
    private List<Image> images;
    private Profile[] profiles;
}
