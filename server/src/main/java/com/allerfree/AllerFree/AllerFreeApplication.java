package com.allerfree.AllerFree;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import com.allerfree.AllerFree.repository.MenuResultRepository;

@SpringBootApplication
@EnableCaching
@EnableMongoRepositories(basePackageClasses = MenuResultRepository.class)
public class AllerFreeApplication {

	public static void main(String[] args) {
		SpringApplication.run(AllerFreeApplication.class, args);
	}

}
