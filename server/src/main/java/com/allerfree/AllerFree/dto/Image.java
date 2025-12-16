package com.allerfree.AllerFree.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class Image {
    private String base64;
    private String mime_type;

    public Image(){
        base64 = "";
        mime_type = "";
    }
}
