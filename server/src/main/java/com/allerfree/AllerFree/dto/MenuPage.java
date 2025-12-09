package com.allerfree.AllerFree.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class MenuPage {
    private List<MenuSection> sections = new ArrayList<MenuSection>();

    public void combineSections(List<MenuSection> sec){
        sections.addAll(sec);
    }

    public void addNewSection(MenuSection section){
        List<MenuItem> empty = new ArrayList<MenuItem>();
        MenuSection sec = new MenuSection(section.getSection(), section.getDescription(), empty);
        sections.add(sec);
    }
}
