package com.allerfree.AllerFree.controller;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.apache.commons.codec.binary.Base64;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
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
public class TestController {    
    @Autowired
    private WebClient webClient;

    private final List<String> mimeTypes = Arrays.asList("image/jpeg", "image/png", "image/webp");

    @PostMapping("/detect")
    public ResponseEntity<MenuResponse> detectAllergens(@RequestBody AllergenDetection ad){
        //For error handling
        List<Integer> successful = new ArrayList<Integer>();
        HashMap<Integer, String> failed = new HashMap<Integer, String>();

        Set<String> allergySet = new HashSet<>(); //Combine all allergies into a set
        for (Profile profile : ad.getProfiles()){
            for (Allergy allergy : profile.getAllergens()){
                allergySet.add(allergy.getAllergen());
            }
        }

        long startTimeMilli = System.currentTimeMillis();

        Flux<Image> imageFlux = Flux.fromIterable(ad.getImages());
        Mono<List<MenuOutput>> results = imageFlux.flatMapSequential(image -> 
            {
                MenuRequest currentRequest = new MenuRequest(allergySet, image);
                return webClient.post()
                                .uri("/detect/menu_image/")
                                .contentType(MediaType.APPLICATION_JSON)
                                .bodyValue(currentRequest).retrieve()

                                //Error Handling
                                .onStatus(HttpStatusCode::isError, response -> 
                                    response.bodyToMono(String.class)
                                            .flatMap(e -> {
                                                System.out.println("Something went wrong when POSTing to Menu Reader: " + e);
                                                //failed.put(imgCounter,"Something went wrong when POSTing to Menu Reader: " + errorBody);
                                                return Mono.empty(); // Skip failed request
                                            })
                                    )
                                .bodyToMono(MenuOutput.class)
                                .onErrorResume(e -> {
                                    System.out.println("Something went wrong when POSTing to Menu Reader: " + e);
                                    //failed.put(imgCounter,"Something went wrong when POSTing to Menu Reader: " + e);
                                    return Mono.empty(); // Skip failed request
                                });
            })
            .collectList(); //Collect all responses into a list

        long endTimeMilli = System.currentTimeMillis();
        long durationMilli = endTimeMilli - startTimeMilli;
        System.out.println("Execution time in milliseconds: " + durationMilli);

        MenuResponse menuResults = new MenuResponse(); //Object to return to frontend

        //Parse + Format Response
        menuResults.setFailed(failed);
        menuResults.setSuccessful(successful);
        menuResults.setResults(parseResponse(results.block(), ad.getProfiles()));
        return ResponseEntity.ok(menuResults);
    }
    
    //Parses and formats aggregated responses from LLM API
        //Into a map where each profile gets its own menu
        //With allergy predictions specific to that profile (depending on allergies and sensitivity)
    public HashMap<String, MenuOutput> parseResponse(List<MenuOutput> menuResponse, Profile[] profiles){
        //Setup HashMap
        HashMap<String, MenuOutput> result = new HashMap<String, MenuOutput>();
        for (Profile prof : profiles){ //Seed map with profile names and empty menu outputs
            result.put(prof.getName(), new MenuOutput());
        }

        HashSet<String> seenItems = new HashSet<String>(); //to handle duplicate menu images (and thus duplicate menu items)

        //Loop through all items in the LLM response
        for (MenuOutput output : menuResponse){
            for (MenuSection section : output.getSections()){
                //Create copy sections for each profile
                for (Profile prof : profiles){
                    result.get(prof.getName()).addNewSection(section);
                }

                for (MenuItem item : section.getItems()){ //For every item in the menu
                    if (!seenItems.contains(item.getName())){ //Filter seen items
                        for (Profile prof : profiles){ //Create copy items for each profiles respective menu
                            List<MenuSection> tempSections = result.get(prof.getName()).getSections();
                            tempSections.get(tempSections.size() - 1).addMenuItem(item, prof.getAllergens()); 
                        }
                    }
                    seenItems.add(item.getName());
                }

                //Remove empty sections
                for (Profile prof : profiles){
                    List<MenuSection> tempSections = result.get(prof.getName()).getSections();
                    if (tempSections.get(tempSections.size() - 1).getItems().size() == 0){ //If last section has no MenuItems -> remove from sections list
                        tempSections.remove(tempSections.size() - 1);
                    }
                }

            }
        }
        return result;
    }
    
    
    //TEMPORARY STUFF
    @ExceptionHandler
    public ResponseEntity<Object> handleIllegalArgumentException(IllegalArgumentException e) {
        return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
    }

    //JUST OUTPUTS LLM RESPONSE AGGREGATED (WITHOUT PARSING + FORMATTING)
    @PostMapping("/detect_test")
    public ResponseEntity<MenuResponse> detectAllergensTest(@RequestBody AllergenDetection ad){
        //For input validation
        List<Integer> successful = new ArrayList<Integer>();
        HashMap<Integer, String> failed = new HashMap<Integer, String>();

        Set<String> allergySet = new HashSet<>(); //Combine all allergies into a set
        for (Profile profile : ad.getProfiles()){
            for (Allergy allergy : profile.getAllergens()){
                allergySet.add(allergy.getAllergen());
            }
        }

        MenuOutput aggregatedOutputs = new MenuOutput();
        MenuRequest requestBody = new MenuRequest(); //Object to serialize as request body for LLM API
        
        long startTimeMilli = System.currentTimeMillis();
        
        requestBody.setAllergies(allergySet);
        int imgCounter = 0;
        for (Image img : ad.getImages()){ //Send one image at a time to LLM API

            if (!Base64.isBase64(img.getBase64().getBytes())){ //Skip images not Base64 encoded
                failed.put(imgCounter, "Image is not Base64 encoded");
            }else if (!mimeTypes.contains(img.getMime_type())){ //Skip images with invalid mime types
                failed.put(imgCounter,"Invalid mime type");
            }else{ //Attempt to send image to LLM API
                requestBody.setImage(img);
                try{
                    //Make POST requests to LLM API and store in menuResults
                    MenuOutput output = webClient.post().uri("/detect/menu_image/").contentType(MediaType.APPLICATION_JSON).bodyValue(requestBody).retrieve().bodyToMono(MenuOutput.class).block();
                    aggregatedOutputs.combineSections(output.getSections()); //Aggregate results from LLM into one MenuResponse object
                    successful.add(imgCounter);
                }catch (Exception e){ //Temporary error handling
                    failed.put(imgCounter,"SOMETHING WENT WRONG WITH POST REQUEST TO LLM API: " + e.getMessage());
                }
            }

            imgCounter++;
        }
        long endTimeMilli = System.currentTimeMillis();
        long durationMilli = endTimeMilli - startTimeMilli;
        System.out.println("Execution time in milliseconds: " + durationMilli);


        MenuResponse menuResults = new MenuResponse(); //Object to deserialize response from LLM API

        //Parse + Format Response
        menuResults.setFailed(failed);
        menuResults.setSuccessful(successful);
        menuResults.setResults(parseResponse(aggregatedOutputs, ad.getProfiles()));
        return ResponseEntity.ok(menuResults);
        
    }

    public HashMap<String, MenuOutput> parseResponse(MenuOutput menuResponse, Profile[] profiles){
        //Setup HashMap
        HashMap<String, MenuOutput> result = new HashMap<String, MenuOutput>();
        for (Profile prof : profiles){ //Seed map with profile names and empty menu outputs
            result.put(prof.getName(), new MenuOutput());
        }

        HashSet<String> seenItems = new HashSet<String>(); //to handle duplicate menu images (and thus duplicate menu items)

        //Loop through all items in the LLM response
            for (MenuSection section : menuResponse.getSections()){
                //Create copy sections for each profile
                for (Profile prof : profiles){
                    result.get(prof.getName()).addNewSection(section);
                }

                for (MenuItem item : section.getItems()){ //For every item in the menu
                    if (!seenItems.contains(item.getName())){ //Filter seen items
                        for (Profile prof : profiles){ //Create copy items for each profiles respective menu
                            List<MenuSection> tempSections = result.get(prof.getName()).getSections();
                            tempSections.get(tempSections.size() - 1).addMenuItem(item, prof.getAllergens()); 
                        }
                    }
                    seenItems.add(item.getName());
                }

                //Remove empty sections
                for (Profile prof : profiles){
                    List<MenuSection> tempSections = result.get(prof.getName()).getSections();
                    if (tempSections.get(tempSections.size() - 1).getItems().size() == 0){ //If last section has no MenuItems -> remove from sections list
                        tempSections.remove(tempSections.size() - 1);
                    }
                }

            }
        return result;
    }

}