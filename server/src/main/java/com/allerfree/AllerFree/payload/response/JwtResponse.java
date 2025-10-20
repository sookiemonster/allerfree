package com.allerfree.AllerFree.payload.response;

import lombok.Getter;
import lombok.Setter;

public class JwtResponse {
    @Getter
    @Setter
    private String token;
    
    @Getter
    private String type = "Bearer";
    
    @Getter
    @Setter
    private String username;

    public JwtResponse(String token) {
        this.token = token;
        this.username = "username";
    }
}
