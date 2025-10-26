package com.allerfree.AllerFree.controller;

import java.time.LocalTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.codec.binary.Base64;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

import com.allerfree.AllerFree.dto.AllergenDetection;
import com.allerfree.AllerFree.dto.Allergy;
import com.allerfree.AllerFree.dto.Image;
import com.allerfree.AllerFree.dto.MenuItem;
import com.allerfree.AllerFree.dto.MenuOutput;
import com.allerfree.AllerFree.dto.MenuRequest;
import com.allerfree.AllerFree.dto.MenuResponse;
import com.allerfree.AllerFree.dto.MenuSection;
import com.allerfree.AllerFree.dto.Profile;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
public class MenuController {    
    @Autowired
    private WebClient webClient;

    private final List<String> mimeTypes = Arrays.asList("image/jpeg", "image/png", "image/webp");

    @PostMapping("/detect")
    public ResponseEntity<MenuResponse> detectAllergens(@RequestBody AllergenDetection ad){
        //For error handling
        HashMap<Integer, String> failed = new HashMap<Integer, String>();

        Set<String> allergySet = new HashSet<>(); //Combine all allergies into a set
        for (Profile profile : ad.getProfiles().values()){
            for (Allergy allergy : profile.getAllergens()){
                allergySet.add(allergy.getAllergen());
            }
        }

        Flux<Image> imageFlux = Flux.fromIterable(ad.getImages());
        Mono<List<MenuOutput>> results = imageFlux.flatMapSequential(image -> 
            {
                int imgIndex = ad.getImages().indexOf(image);
                if (!Base64.isBase64(image.getBase64().getBytes())){ //Skip images not Base64 encoded
                    failed.put(imgIndex, "Image is not Base64 encoded");
                    return Mono.empty(); // Skip failed request
                }else if (!mimeTypes.contains(image.getMime_type())){ //Skip images with invalid mime types
                    failed.put(imgIndex, "Invalid mime type");
                    return Mono.empty(); // Skip failed request
                }else{ //Attempt to send image to LLM API
                    MenuRequest currentRequest = new MenuRequest(allergySet, image);
                    return webClient.post()
                                    .uri("/detect/menu_image/")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .bodyValue(currentRequest).retrieve()

                                    //Error Handling
                                    .onStatus(HttpStatusCode::isError, response -> 
                                        response.bodyToMono(String.class)
                                                .flatMap(e -> {
                                                    failed.put(imgIndex, "Something went wrong when POSTing to Menu Reader: " + e);
                                                    return Mono.empty(); // Skip failed request
                                                })
                                        )
                                    .bodyToMono(MenuOutput.class)
                                    .onErrorResume(e -> {
                                        failed.put(imgIndex, "Something went wrong when POSTing to Menu Reader: " + e);
                                        return Mono.empty(); // Skip failed request
                                    });
                }
            })
            .collectList(); //Collect all responses into a list

        MenuResponse menuResults = new MenuResponse(); //Object to return to frontend
        //Parse + Format Response
        menuResults.setFailed(failed);
        menuResults.setResults(parseResponse(results.block(), ad.getProfiles()));
        System.out.println("Done at : " + LocalTime.now());
        return ResponseEntity.ok(menuResults);
    }
    
    //Parses and formats aggregated responses from LLM API
        //Into a map where each profile gets its own menu
        //With allergy predictions specific to that profile (depending on allergies and sensitivity)
    public HashMap<String, MenuOutput> parseResponse(List<MenuOutput> menuResponse, HashMap<String, Profile> profiles){
        //Setup HashMap
        HashMap<String, MenuOutput> result = new HashMap<String, MenuOutput>();
        for (String profName : profiles.keySet()){ //Seed map with profile names and empty menu outputs
            result.put(profName, new MenuOutput());
        }

        HashSet<String> seenItems = new HashSet<String>(); //to handle duplicate menu images (and thus duplicate menu items)

        //Loop through all items in the LLM response
        for (MenuOutput output : menuResponse){
            for (MenuSection section : output.getSections()){
                //Create copy sections for each profile
                for (String profName : profiles.keySet()) {
                    result.get(profName).addNewSection(section);
                }

                for (MenuItem item : section.getItems()){ //For every item in the menu
                    if (!seenItems.contains(item.getName())){ //Filter seen items
                        for (Map.Entry<String, Profile> prof : profiles.entrySet()) { //Create copy items for each profiles respective menu
                            List<MenuSection> tempSections = result.get(prof.getKey()).getSections();
                            tempSections.get(tempSections.size() - 1).addMenuItem(item, prof.getValue().getAllergens()); 
                        }
                    }
                    seenItems.add(item.getName());
                }

                //Remove empty sections
                for (String profName : profiles.keySet()) {
                    List<MenuSection> tempSections = result.get(profName).getSections();
                    if (tempSections.get(tempSections.size() - 1).getItems().size() == 0){ //If last section has no MenuItems -> remove from sections list
                        tempSections.remove(tempSections.size() - 1);
                    }
                }

            }
        }
        return result;
    }

    @PostMapping("/detectSample")
    public ResponseEntity<MenuResponse> detectAllergensSample(@RequestBody AllergenDetection ad){
        MenuResponse menuResults = new MenuResponse();
        return ResponseEntity.ok(menuResults);
    }
}