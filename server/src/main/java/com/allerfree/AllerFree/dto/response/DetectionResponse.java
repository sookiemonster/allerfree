package com.allerfree.AllerFree.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;

import com.allerfree.AllerFree.dto.MenuPage;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class DetectionResponse {
    private HashMap<Integer, String> failed;
    private HashMap<String, MenuPage> results;
}
