package com.allerfree.AllerFree.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import com.allerfree.AllerFree.payload.response.JwtResponse;
import com.allerfree.AllerFree.service.JwtUtil;

import org.springframework.web.bind.annotation.PostMapping;

@RestController
public class AuthController {
    @Autowired
    private JwtUtil jwtUtil;

    //Generates a token based on given username and returns it
    @PostMapping("/requestToken")
    public ResponseEntity<?> requestJWT() throws Exception {
        String token = jwtUtil.generateToken();
        return ResponseEntity.ok(new JwtResponse(token));
    }
    
}
