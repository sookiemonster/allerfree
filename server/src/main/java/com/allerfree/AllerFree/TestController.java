package com.allerfree.AllerFree;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.core.publisher.Mono;

@RestController
public class TestController {    
    @Autowired
    private WebClient webClient;
    
    @GetMapping("/testAPI")
    public Mono<String> dummyAPICall() {
        return webClient.get().uri("/health").retrieve().bodyToMono(String.class);
    }
    
}
