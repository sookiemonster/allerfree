package com.allerfree.AllerFree.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.allerfree.AllerFree.dto.Image;

@AllArgsConstructor
@Data
public class LlmRequest {
    private Set<String> allergies;
    private List<Image> images;

    public LlmRequest(){
        allergies = new HashSet<String>();
        images = new ArrayList<Image>();
    }
}
