package com.allerfree.AllerFree.payload.response;

import lombok.Getter;
import lombok.Setter;

public class TestResponse {
    @Getter
    @Setter
    private String greeting;

    public TestResponse(String greeting){
        this.greeting = greeting;
    }

}
