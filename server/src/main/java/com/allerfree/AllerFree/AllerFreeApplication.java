package com.allerfree.AllerFree;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class AllerFreeApplication {

	public static void main(String[] args) {
		SpringApplication.run(AllerFreeApplication.class, args);
	}

}
