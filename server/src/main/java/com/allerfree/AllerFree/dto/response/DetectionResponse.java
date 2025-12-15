package com.allerfree.AllerFree.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.HashMap;

import com.allerfree.AllerFree.dto.MenuPage;

@AllArgsConstructor
@Data
public class DetectionResponse {
    private HashMap<Integer, String> failed;
    private HashMap<String, MenuPage> results;

    public DetectionResponse(){
        failed = new HashMap<Integer, String>();
        results = new HashMap<String, MenuPage>();
    }
}
