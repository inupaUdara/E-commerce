package com.gocart.userservice.controller;

import com.gocart.userservice.dto.UserResponse;
import com.gocart.userservice.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
@Tag(name = "User", description = "User management APIs")
@SecurityRequirement(name = "Bearer Authentication")
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Returns the currently authenticated user's information")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        UserResponse user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Returns user information by user ID")
    public ResponseEntity<UserResponse> getUserById(@PathVariable String id) {
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }
}
