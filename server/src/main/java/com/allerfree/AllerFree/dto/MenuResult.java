package com.allerfree.AllerFree.dto;

import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "menuResults")
@CompoundIndex(name = "restaurant_unique_key", def = "{'restaurantName': 1, 'restaurantLocation': 1}", unique = true)
public class MenuResult {

    @Id
    private ObjectId id;

    private String restaurantName;
    private String restaurantLocation;

    private List<MenuOutput> results;
}