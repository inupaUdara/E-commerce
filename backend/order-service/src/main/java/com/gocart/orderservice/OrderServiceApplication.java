package com.gocart.orderservice;

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
		title = "Order Service API",
		version = "1.0",
		description = "Microservice for order processing and payment management",
		contact = @Contact(
			name = "GoCart Team",
			email = "support@gocart.com"
		)
	)
)
public class OrderServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(OrderServiceApplication.class, args);
	}

}
