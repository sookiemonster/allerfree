package com.allerfree.AllerFree.repository;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.allerfree.AllerFree.dto.Menu;

@Repository
public interface MenuRepository extends MongoRepository<Menu, ObjectId>{

    Menu findByRestaurantNameAndRestaurantLocation(String name, String location);

}