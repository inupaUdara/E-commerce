package com.gocart.storeservice.client;

import com.gocart.storeservice.dto.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service", url = "${user.service.url}")
public interface UserServiceClient {
    
    @GetMapping("/api/users/{id}")
    UserResponse getUserById(
            @PathVariable("id") String id,
            @RequestHeader("Authorization") String authorization);
}
