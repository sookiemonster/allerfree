package com.allerfree.AllerFree.controller;

import org.apache.commons.codec.binary.Base64;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

import com.allerfree.AllerFree.payload.response.TestResponse;

@RestController
public class TestController {    
    @Autowired
    private WebClient webClient;
    
    @GetMapping("/testAPI")
    public ResponseEntity<?> dummyAPICall() {
        System.out.println("GET REQUEST");
        System.out.println(webClient.get().uri("/health").retrieve().bodyToMono(String.class).block());
        return ResponseEntity.ok(new TestResponse(webClient.get().uri("/health").retrieve().bodyToMono(String.class).block()));
    }

    @GetMapping("/testAPI2")
    public ResponseEntity<?> dummyAPICall2(){
        String originalInput = "TEST";
        String encodedString = new String(Base64.encodeBase64(originalInput.getBytes()));
        System.out.println(Base64.isBase64(encodedString.getBytes()));
        return ResponseEntity.ok(new TestResponse(webClient.get().uri("/health").retrieve().bodyToMono(String.class).block()));
    }

    @GetMapping("/testAPI3")
    public String dummyAPICall3() {
        System.out.println("GET REQUEST 3");
        return "SUCCESS";
    }
}