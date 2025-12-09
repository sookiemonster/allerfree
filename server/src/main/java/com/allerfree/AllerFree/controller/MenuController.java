package com.allerfree.AllerFree.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.allerfree.AllerFree.dto.request.DetectionRequest;
import com.allerfree.AllerFree.dto.response.DetectionResponse;
import com.allerfree.AllerFree.service.MenuService;

@RestController
public class MenuController {    
    @Autowired
    private MenuService menuService;

    @PostMapping("/detect")
    public ResponseEntity<DetectionResponse> detectAllergens(@RequestBody DetectionRequest ad){
        return ResponseEntity.ok(menuService.detectAllergens(ad));
    }

}