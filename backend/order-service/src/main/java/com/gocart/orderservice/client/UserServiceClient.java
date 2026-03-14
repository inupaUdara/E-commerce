package com.gocart.orderservice.client;

import com.gocart.orderservice.dto.UserResponse;
import com.gocart.orderservice.dto.AddressResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service", url = "${user.service.url}")
public interface UserServiceClient {
    
    @GetMapping("/api/users/{id}")
    UserResponse getUserById(@PathVariable("id") String id);
    
    @GetMapping("/api/addresses/{id}")
    AddressResponse getAddressById(@PathVariable("id") String id);
}
