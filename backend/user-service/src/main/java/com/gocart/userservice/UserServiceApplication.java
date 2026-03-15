package com.gocart.userservice;

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
		title = "User Service API",
		version = "1.0",
		description = "Microservice for user authentication and management",
		contact = @Contact(
			name = "GoCart Team",
			email = "support@gocart.com"
		)
	)
)
public class UserServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(UserServiceApplication.class, args);
	}

}
