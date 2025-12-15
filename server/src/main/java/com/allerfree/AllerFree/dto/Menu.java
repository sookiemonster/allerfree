package com.allerfree.AllerFree.dto;

import java.util.Date;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
@Document(collection = "menus")
@CompoundIndex(name = "restaurant_unique_key", def = "{'restaurantName': 1, 'restaurantLocation': 1}", unique = true)
public class Menu {

    @Id
    private ObjectId id;

    @NotNull
    private String restaurantName;
    @NotNull
    private Coordinate restaurantLocation;

    @NotNull
    private MenuPage results;

    @NotNull
    @Indexed(expireAfter = "864000s") //10 days
    private Date creationTime; 

    public Menu(){
        restaurantName = "";
        restaurantLocation = new Coordinate();
        results = new MenuPage();
        creationTime = new Date();
    }
}