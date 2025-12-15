package com.allerfree.AllerFree.dto.response;

import java.util.HashMap;

import com.allerfree.AllerFree.dto.MenuPage;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LlmResponse {
    private MenuPage menu;
    private HashMap<Integer, String> failed;

    public LlmResponse(){
        menu = new MenuPage();
        failed = new HashMap<Integer, String>();
    }

    public void putFailed(int index, String error){
        failed.put(index, error);
    }
}
