package com.allerfree.AllerFree;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.task.DelegatingSecurityContextAsyncTaskExecutor;

import com.allerfree.AllerFree.repository.MenuRepository;

@SpringBootApplication
@EnableCaching
@EnableAsync
@EnableMongoRepositories(basePackageClasses = MenuRepository.class)
public class AllerFreeApplication {

	@Primary
	@Bean(name = "asyncExec")
	public DelegatingSecurityContextAsyncTaskExecutor taskExecutor() {
		ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
		executor.setCorePoolSize(2);
		executor.setMaxPoolSize(4);
		executor.setQueueCapacity(50);
		executor.initialize();
		return new DelegatingSecurityContextAsyncTaskExecutor(executor);
	}

	@Bean(name = "taskExecutorForLLM")
	public DelegatingSecurityContextAsyncTaskExecutor taskExecutorForLLM() {
		ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
		executor.setCorePoolSize(2);
		executor.setMaxPoolSize(4);
		executor.setQueueCapacity(50);
		executor.initialize();
		return new DelegatingSecurityContextAsyncTaskExecutor(executor);
	}


	public static void main(String[] args) {
		SecurityContextHolder.setStrategyName(SecurityContextHolder.MODE_INHERITABLETHREADLOCAL);
		SpringApplication.run(AllerFreeApplication.class, args);
	}

}
