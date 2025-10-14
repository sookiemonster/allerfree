package com.allerfree.AllerFree.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class MenuRequest {
    private Set<String> allergies;
    private Image image;
}
