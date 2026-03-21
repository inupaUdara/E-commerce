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

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
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

    @PostMapping("/me/followed-stores/{storeId}")
    @Operation(summary = "Follow a store", description = "Adds a store to the current user's followed stores list")
    public ResponseEntity<UserResponse> followStore(
            Authentication authentication,
            @PathVariable String storeId) {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.followStore(email, storeId));
    }

    @DeleteMapping("/me/followed-stores/{storeId}")
    @Operation(summary = "Unfollow a store", description = "Removes a store from the current user's followed stores list")
    public ResponseEntity<UserResponse> unfollowStore(
            Authentication authentication,
            @PathVariable String storeId) {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.unfollowStore(email, storeId));
    }

    @GetMapping("/me/followed-stores")
    @Operation(summary = "Get followed stores", description = "Returns followed store IDs for the current user")
    public ResponseEntity<List<String>> getFollowedStores(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.getFollowedStoreIds(email));
    }

    @GetMapping("/followers/count")
    @Operation(summary = "Get follower count for a store", description = "Returns the number of users following the given store")
    public ResponseEntity<Long> getFollowerCount(@RequestParam String storeId) {
        return ResponseEntity.ok(userService.countFollowers(storeId));
    }
}
