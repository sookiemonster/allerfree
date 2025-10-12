package com.allerfree.AllerFree;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    WebClient webClient() {
        return WebClient.builder()
                .baseUrl("https://9eiu2hf4c3.execute-api.us-east-1.amazonaws.com")
                .build();
    }

}