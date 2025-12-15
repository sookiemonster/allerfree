package com.allerfree.AllerFree;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import com.allerfree.AllerFree.repository.MenuRepository;

@SpringBootApplication
@EnableCaching
@EnableAsync
@EnableMongoRepositories(basePackageClasses = MenuRepository.class)
public class AllerFreeApplication {

	@Primary
	@Bean
	public ThreadPoolTaskExecutor taskExecutor() {
		ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
		executor.setCorePoolSize(10);
		executor.setMaxPoolSize(20);
		executor.setQueueCapacity(500);
		executor.setThreadNamePrefix("AsyncThread-");
		executor.initialize();
		return executor;
	}

	@Bean
	public ThreadPoolTaskExecutor taskExecutorForLLM() {
		ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
		executor.setCorePoolSize(2);
		executor.setMaxPoolSize(4);
		executor.setQueueCapacity(250);
		executor.setThreadNamePrefix("LLMAsyncThread-");
		executor.initialize();
		return executor;
	}

	public static void main(String[] args) {
		SpringApplication.run(AllerFreeApplication.class, args);
	}

}
