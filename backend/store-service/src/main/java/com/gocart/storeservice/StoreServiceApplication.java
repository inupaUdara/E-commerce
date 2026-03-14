package com.gocart.storeservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.Contact;

@SpringBootApplication
@EnableFeignClients
@OpenAPIDefinition(
	info = @Info(
		title = "Store Service API",
		version = "1.0",
		description = "Microservice for vendor store management",
		contact = @Contact(
			name = "GoCart Team",
			email = "support@gocart.com"
		)
	)
)
public class StoreServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(StoreServiceApplication.class, args);
	}

}
