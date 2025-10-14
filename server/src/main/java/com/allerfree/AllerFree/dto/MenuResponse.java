package com.allerfree.AllerFree.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class MenuResponse {
    private List<Integer> successful;
    private HashMap<Integer, String> failed;
    private List<MenuSection> sections = new ArrayList<MenuSection>();

    public void combineSections(List<MenuSection> sec){
        sections.addAll(sec);
    }
}
