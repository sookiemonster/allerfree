package com.allerfree.AllerFree.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

import com.allerfree.AllerFree.dto.Image;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class LlmRequest {
    private Set<String> allergies;
    private Image image;
}
