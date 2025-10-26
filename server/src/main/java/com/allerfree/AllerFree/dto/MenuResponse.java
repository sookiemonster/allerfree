package com.allerfree.AllerFree.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class MenuResponse {
    private HashMap<Integer, String> failed;
    private HashMap<String, MenuOutput> results;
}
