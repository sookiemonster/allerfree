package com.allerfree.AllerFree.service;

import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;


import org.apache.commons.codec.binary.Base64;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.allerfree.AllerFree.dto.Coordinate;
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
import com.fasterxml.jackson.databind.ObjectMapper;

import reactor.core.publisher.Mono;

@Service
public class MenuService {
    @Autowired
    private WebClient webClient;

    private final List<String> mimeTypes = Arrays.asList("image/jpeg", "image/png", "image/webp");
    
    private final Set<String> allAllergies = new HashSet<String>(Arrays.asList("gluten", "tree_nuts", "shellfish"));

    private final MongoTemplate mongoTemplate;

    private final MenuRepository menuRepo;
    public MenuService(MenuRepository menuRepo, MongoTemplate mongoTemplate) {
        this.menuRepo = menuRepo;
        this.mongoTemplate = mongoTemplate;
    }

    @Async("asyncExec")
    //Check MongoDB cluster for existing menu document
    public CompletableFuture<Menu> checkCache(String restaurantName, Coordinate coords){
        Menu cached = menuRepo.findByRestaurantNameAndRestaurantLocation(restaurantName, coords);
        return CompletableFuture.supplyAsync(() -> {
            //If we query something -> refresh creation time (so it persists if accessed frequently)
            if (cached != null){
                Update update = new Update().set("creationTime", new Date())
                                            .set("results", cached.getResults());
                mongoTemplate.upsert(new Query(Criteria.where("restaurantName").is(restaurantName).and("restaurantLocation").is(coords)), 
                                    update, Menu.class, "menus");
            }
            return cached;
        }).handle((result, e) -> {
            clearCacheOldest();
            return cached;
        });
    }

    @Async("asyncExec")
    //Save Menu into MongoDB Cluster
    public CompletableFuture<Void> saveToCache(String restaurantName, Coordinate restaurantLocation, MenuPage results){
        //Create document in cluster
        // System.out.println("Saving to MongoDB Cluster")
        Update update = new Update().set("creationTime", new Date())
                                    .set("results", results);
        mongoTemplate.upsert(new Query(Criteria.where("restaurantName").is(restaurantName).and("restaurantLocation").is(restaurantLocation)), 
                            update, Menu.class, "menus");
        return CompletableFuture.completedFuture(null);
    }

    @Async("asyncExec")
    public void clearCacheOldest(){
        //Get 50 oldest documents and remove them
        Query findOldestQuery = new Query();
        findOldestQuery.with(Sort.by(Sort.Direction.ASC, "creationDate")).limit(100);

        mongoTemplate.remove(findOldestQuery, "menus");
    }

    @Async("taskExecutorForLLM")
    public CompletableFuture<LlmResponse> llmCall(List<Image> images){
        System.out.println("Calling LLM");
        LlmResponse res = new LlmResponse();

        //Filter bad images from the list
        for (int i = 0, imgIndex = 0; i < images.size(); i++, imgIndex++){
            if (!Base64.isBase64(images.get(i).getBase64().getBytes())){ //Skip images not Base64 encoded
                res.putFailed(imgIndex, "Image is not Base64 encoded");
                images.remove(i);
                i--;
            }else if (!mimeTypes.contains(images.get(i).getMime_type())){ //Skip images with invalid mime types
                res.putFailed(imgIndex, "Invalid mime type");
                images.remove(i);
                i--;
            }
        }
        
        //Make LLM Request
        LlmRequest currentRequest = new LlmRequest(allAllergies, images);
        Mono<MenuPage> menu = webClient.post()
                                    .uri("/detect/menu_image_batch/")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .bodyValue(currentRequest).retrieve()

                                    //Error Handling
                                    .onStatus(HttpStatusCode::isError, response -> 
                                        response.bodyToMono(String.class)
                                                .flatMap(e -> {
                                                    res.putFailed(-1, "Something went wrong when POSTing to Menu Reader: " + e);
                                                    return Mono.empty(); // Skip failed request
                                                })
                                        )
                                    .bodyToMono(MenuPage.class)
                                    .onErrorResume(e -> {
                                        res.putFailed(-1, "Something went wrong when POSTing to Menu Reader: " + e);
                                        return Mono.empty(); // Skip failed request
                                    });
        return menu.toFuture()
                    .thenApply(menuRes -> {
                        res.setMenu(menuRes);
                        return res;
                    });
    }

    @Async("taskExecutorForLLM")
        public CompletableFuture<DetectionResponse> callLLMandSave(DetectionRequest req){
            CompletableFuture<LlmResponse> llmResponse = llmCall(req.getImages());
                            return llmResponse.thenCompose(llmRes -> {
                                DetectionResponse llmDetect = new DetectionResponse();
                                llmDetect.setFailed(llmRes.getFailed());
                                llmDetect.setResults(parseResponse(llmRes.getMenu(), req.getProfiles()));
                                if (llmRes.getMenu() == null){
                                    return CompletableFuture.completedFuture(llmDetect);
                                }
                                return saveToCache(req.getRestaurantName(), req.getRestaurantLocation(), llmRes.getMenu())
                                                .handle((voidRes, e) -> {
                                                    clearCacheOldest();
                                                    return llmDetect;
                                                });
                            });
        }
    
    //Parses and formats aggregated responses from LLM API
        //Into a map where each profile gets its own menu
        //With allergy predictions specific to that profile (depending on allergies and sensitivity)
    public HashMap<String, MenuPage> parseResponse(MenuPage menuResponse, HashMap<String, Profile> profiles){
        //Setup HashMap
        HashMap<String, MenuPage> result = new HashMap<String, MenuPage>();
        for (String profName : profiles.keySet()){ //Seed map with profile names and empty menu outputs
            result.put(profName, new MenuPage());
        }
        
        if (menuResponse == null){
            return result;
        }

        HashSet<String> seenItems = new HashSet<String>(); //to handle duplicate menu images (and thus duplicate menu items)

        //Loop through all items in the LLM response
        for (MenuSection section : menuResponse.getSections()){
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
                if (tempSections.get(tempSections.size() - 1).getItems().size() == 0){ //If last section has no MenuItems (i.e. duplicate section) -> remove from sections list
                    tempSections.remove(tempSections.size() - 1);
                }
            }
        }
        return result;
    }

    @Value("classpath:data/SampleResponse.json")
    private Resource sampleResponseResource;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Async
    public void seedDB(){
        MenuPage resultAsList = new MenuPage();
        try (var inputStream = sampleResponseResource.getInputStream()) {
            MenuPage menu = objectMapper.readValue(inputStream, MenuPage.class);
            resultAsList.combineSections(menu.getSections());
        } catch (Exception e) {
            e.printStackTrace();
        }

        for (int i = 1; i < 3750; i++){
            double lat = i;
            double lng = i;
            saveToCache(Integer.toString(i), new Coordinate(lat, lng), resultAsList);
        }
    }

    // @Async
    // public void clearDB(){
    //     for (int i = 3500; i < 4000; i++){
    //         Menu temp = (checkCache(Integer.toString(i), new Coordinate(0.0, 0.0))); 
    //         if (temp != null){
    //             menuRepo.delete(temp);
    //         }
    //     }
    // }
}

    // public DetectionResponse detectAllergens(DetectionRequest req){
    //     HashMap<Integer, String> failed = new HashMap<Integer, String>(); //For error handling
    //     DetectionResponse res = new DetectionResponse(); //Object to return to frontend

    //     Set<String> allergySet = new HashSet<>(); //Combine all allergies into a set
    //     for (Profile profile : req.getProfiles().values()){
    //         for (Allergy allergy : profile.getAllergens()){
    //             allergySet.add(allergy.getAllergen());
    //         }
    //     }

    //     if (req.getImages().size() == 0){
    //         failed.put(-1, "No images to analyze");
    //     }
    //     else if (req.getProfiles().size() == 0){
    //         failed.put(-2, "No profile to analyze with");
    //     }
    //     else if (allergySet.size() == 0){
    //         failed.put(-3, "No allergies to analyze with");
    //     }

    //     if (failed.size() > 0){ //If at least one error from above checks -> terminate early
    //         res.setFailed(failed);
    //         return res;
    //     }

    //     MenuPage menu = new MenuPage();
    //     //Query MongoDB Cluster for specific restaurant (with name + location)
    //     Menu result = checkCache(req.getRestaurantName(), req.getRestaurantLocation());
        
    //     if (result != null){ //found entry in db
    //         menu = result.getResults();
    //     }else{ //didn't find -> call LLM
    //         LlmResponse response = llmCall(req.getImages());
    //         menu = response.getMenu();
    //         res.setFailed(response.getFailed());

    //         //At this point save to MongoDB
    //         saveToCache(req.getRestaurantName(), req.getRestaurantLocation(), menu);
    //     }
        
    //     System.out.println("Done at : " + LocalTime.now());
    //     res.setResults(parseResponse(menu, req.getProfiles()));
    //     return res;
    // }