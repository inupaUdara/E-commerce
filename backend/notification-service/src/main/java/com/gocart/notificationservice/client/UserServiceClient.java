package com.gocart.notificationservice.client;

import com.gocart.notificationservice.dto.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "user-service", url = "${user.service.url}")
public interface UserServiceClient {

    @GetMapping("/api/users/me")
    UserResponse getCurrentUser(@RequestHeader("Authorization") String authorization);
}
