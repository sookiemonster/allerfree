package com.allerfree.AllerFree.controller;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.CompletableFuture;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.allerfree.AllerFree.dto.Allergy;
import com.allerfree.AllerFree.dto.Profile;
import com.allerfree.AllerFree.dto.request.DetectionRequest;
import com.allerfree.AllerFree.dto.response.DetectionResponse;
import com.allerfree.AllerFree.service.MenuService;

import org.springframework.web.bind.annotation.GetMapping;

@RestController
public class MenuController {

    @Autowired
    private MenuService menuService;

    @PostMapping("/detect")
    @Async("asyncExec")
    public CompletableFuture<ResponseEntity<DetectionResponse>> detectAllergens(@RequestBody DetectionRequest req){
        HashMap<Integer, String> failed = new HashMap<Integer, String>(); //For error handling
        DetectionResponse res = new DetectionResponse(); //Object to return to frontend

        Set<String> allergySet = new HashSet<String>(); //Combine all allergies into a set
        for (Profile profile : req.getProfiles().values()){
            for (Allergy allergy : profile.getAllergens()){
                allergySet.add(allergy.getAllergen());
            }
        }

        if (req.getImages().size() == 0){
            failed.put(-1, "No images to analyze");
        }
        else if (req.getProfiles().size() == 0){
            failed.put(-2, "No profile to analyze with");
        }
        else if (allergySet.size() == 0){
            failed.put(-3, "No allergies to analyze with");
        }

        if (failed.size() > 0){ //If at least one error from above checks -> terminate early
            res.setFailed(failed);
            return CompletableFuture.completedFuture(ResponseEntity.ok(res));
        }

        return menuService.checkCache(req.getRestaurantName(), req.getRestaurantLocation()) //check cache first
                    .thenCompose(cachedMenu -> {
                        if (cachedMenu != null){ //If entry found in cluster -> parse response and return
                            DetectionResponse cachedDetect = new DetectionResponse();
                            cachedDetect.setResults(menuService.parseResponse(cachedMenu.getResults(), req.getProfiles()));
                            return CompletableFuture.completedFuture(cachedDetect);
                        }else{ //entry not found -> call LLM
                            return menuService.callLLMandSave(req);
                        }
                    }).thenApply(detectionResponse -> ResponseEntity.ok(detectionResponse));
    }

    @GetMapping("seedDB")
    public String seed() {
        try{
            menuService.seedDB();
        }catch(Exception e){
            System.out.println("ERROR HERE");
        }
        return "TEST";
    }
}