package com.allerfree.AllerFree.dto.response;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import com.allerfree.AllerFree.dto.MenuPage;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LlmResponse {
    private List<MenuPage> outputs;
    private HashMap<Integer, String> failures;

    public LlmResponse(){
        outputs = new ArrayList<MenuPage>();
        failures = new HashMap<Integer, String>();
    }

    public void putFailed(int index, String error){
        failures.put(index, error);
    }
}
