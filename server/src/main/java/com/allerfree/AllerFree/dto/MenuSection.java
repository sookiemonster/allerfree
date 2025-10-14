package com.allerfree.AllerFree.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class MenuSection {
    private String section;
    private String description;
    private List<MenuItem> items;
}
