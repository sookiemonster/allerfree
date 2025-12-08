package com.allerfree.AllerFree.repository;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.allerfree.AllerFree.dto.MenuResult;

@Repository
public interface MenuResultRepository extends MongoRepository<MenuResult, ObjectId>{

    MenuResult findByRestaurantNameAndRestaurantLocation(String name, String location);

}