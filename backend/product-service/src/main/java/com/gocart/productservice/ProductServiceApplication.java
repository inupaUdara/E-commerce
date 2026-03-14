package com.gocart.productservice;

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
		title = "Product Service API",
		version = "1.0",
		description = "Microservice for product catalog and ratings management",
		contact = @Contact(
			name = "GoCart Team",
			email = "support@gocart.com"
		)
	)
)
public class ProductServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ProductServiceApplication.class, args);
	}

}
