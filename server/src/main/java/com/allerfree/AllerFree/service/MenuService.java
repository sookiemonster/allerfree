package com.allerfree.AllerFree.service;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.codec.binary.Base64;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.allerfree.AllerFree.dto.Allergy;
import com.allerfree.AllerFree.dto.Image;
import com.allerfree.AllerFree.dto.MenuItem;
import com.allerfree.AllerFree.dto.MenuPage;
import com.allerfree.AllerFree.dto.Menu;
import com.allerfree.AllerFree.dto.MenuSection;
import com.allerfree.AllerFree.dto.Profile;
import com.allerfree.AllerFree.dto.request.DetectionRequest;
import com.allerfree.AllerFree.dto.request.LlmRequest;
import com.allerfree.AllerFree.dto.response.DetectionResponse;
import com.allerfree.AllerFree.dto.response.LlmResponse;
import com.allerfree.AllerFree.repository.MenuRepository;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class MenuService {
    @Autowired
    private WebClient webClient;

    private final List<String> mimeTypes = Arrays.asList("image/jpeg", "image/png", "image/webp");
    
    private final Set<String> allAllergies = new HashSet<String>(Arrays.asList("gluten", "tree_nuts", "shellfish"));

    private final MenuRepository menuRepo;
    public MenuService(MenuRepository menuRepo) {
        this.menuRepo = menuRepo;
    }

    public DetectionResponse detectAllergens(DetectionRequest ad){
        HashMap<Integer, String> failed = new HashMap<Integer, String>(); //For error handling
        DetectionResponse menuResults = new DetectionResponse(); //Object to return to frontend

        Set<String> allergySet = new HashSet<>(); //Combine all allergies into a set
        for (Profile profile : ad.getProfiles().values()){
            for (Allergy allergy : profile.getAllergens()){
                allergySet.add(allergy.getAllergen());
            }
        }

        if (ad.getImages().size() == 0){
            failed.put(-1, "No images to analyze");
        }
        else if (ad.getProfiles().size() == 0){
            failed.put(-2, "No profile to analyze with");
        }
        else if (allergySet.size() == 0){
            failed.put(-3, "No allergies to analyze with");
        }

        if (failed.size() > 0){ //If at least one error from above checks -> terminate early
            menuResults.setFailed(failed);
            return menuResults;
        }

        //Query MongoDB Cluster for specific restaurant (with name + location)
        Menu result = checkCache(ad.getRestaurantName(), ad.getRestaurantLocation());
        List<MenuPage> outputs = new ArrayList<MenuPage>();
        if (result != null){ //found entry in db
            outputs = result.getResults();
        }else{ //didn't find -> call LLM
            LlmResponse response = llmCall(ad.getImages());
            if (response != null){
                outputs = response.getOutputs();
                menuResults.setFailed(response.getFailures());

                //At this point save to MongoDB
                saveToCache(ad.getRestaurantName(), ad.getRestaurantLocation(), outputs);
            }
        }
        
        System.out.println("Done at : " + LocalTime.now());
        menuResults.setResults(parseResponse(outputs, ad.getProfiles()));
        return menuResults;
    }

    @Async
    //Check MongoDB cluster for existing menu document
    private Menu checkCache(String restaurantName, String restaurantLocation){
        Menu cached = menuRepo.findByRestaurantNameAndRestaurantLocation(restaurantName, restaurantLocation);
        //If we query something -> refresh creation time (so it persists if accessed frequently)
        if (cached != null){
            cached.setCreationTime(new Date());
            menuRepo.save(cached);
        }
        return cached;
    }

    @Async
    private LlmResponse llmCall(List<Image> images){
        System.out.println("Calling LLM");
        LlmResponse res = new LlmResponse();

        Flux<Image> imageFlux = Flux.fromIterable(images);
        Mono<List<MenuPage>> pages = imageFlux.flatMapSequential(image -> 
            {
                int imgIndex = images.indexOf(image);
                if (!Base64.isBase64(image.getBase64().getBytes())){ //Skip images not Base64 encoded
                    res.putFailed(imgIndex, "Image is not Base64 encoded");
                    return Mono.empty(); // Skip failed request
                }else if (!mimeTypes.contains(image.getMime_type())){ //Skip images with invalid mime types
                    res.putFailed(imgIndex, "Invalid mime type");
                    return Mono.empty(); // Skip failed request
                }else{ //Attempt to send image to LLM API
                    LlmRequest currentRequest = new LlmRequest(allAllergies, image);
                    return webClient.post()
                                    .uri("/detect/menu_image/")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .bodyValue(currentRequest).retrieve()

                                    //Error Handling
                                    .onStatus(HttpStatusCode::isError, response -> 
                                        response.bodyToMono(String.class)
                                                .flatMap(e -> {
                                                    res.putFailed(imgIndex, "Something went wrong when POSTing to Menu Reader: " + e);
                                                    return Mono.empty(); // Skip failed request
                                                })
                                        )
                                    .bodyToMono(MenuPage.class)
                                    .onErrorResume(e -> {
                                        res.putFailed(imgIndex, "Something went wrong when POSTing to Menu Reader: " + e);
                                        return Mono.empty(); // Skip failed request
                                    });
                }
            })
            .collectList(); //Collect all responses into a list
        res.setOutputs(pages.block());
        return res;
    }

    @Async
    //Save Menu into MongoDB Cluster
    private void saveToCache(String restaurantName, String restaurantLocation, List<MenuPage> results){
        //Create document in cluster
        System.out.println("Saving to MongoDB Cluster");
        Menu toCache = new Menu();
        toCache.setRestaurantName(restaurantName);
        toCache.setRestaurantLocation(restaurantLocation);
        toCache.setResults(results);
        toCache.setCreationTime(new Date());
        menuRepo.insert(toCache);
    }
    
    //Parses and formats aggregated responses from LLM API
        //Into a map where each profile gets its own menu
        //With allergy predictions specific to that profile (depending on allergies and sensitivity)
    public HashMap<String, MenuPage> parseResponse(List<MenuPage> menuResponse, HashMap<String, Profile> profiles){
        //Setup HashMap
        HashMap<String, MenuPage> result = new HashMap<String, MenuPage>();
        for (String profName : profiles.keySet()){ //Seed map with profile names and empty menu outputs
            result.put(profName, new MenuPage());
        }

        HashSet<String> seenItems = new HashSet<String>(); //to handle duplicate menu images (and thus duplicate menu items)

        //Loop through all items in the LLM response
        for (MenuPage output : menuResponse){
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
}
