package com.gocart.storeservice.controller;

import com.gocart.storeservice.dto.StoreRequest;
import com.gocart.storeservice.entity.Store;
import com.gocart.storeservice.service.StoreService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;

@RestController
@RequestMapping("/api/stores")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = {"${CORS_ALLOWED_ORIGIN:http://localhost:3000}", "http://localhost:8080"})
@Tag(name = "Store", description = "Store management APIs")
public class StoreController {

    private final StoreService storeService;
    private final ObjectMapper objectMapper;

    @PostMapping
    @Operation(summary = "Create store", description = "Creates a new store for a user")
    public ResponseEntity<Store> createStore(
            @RequestParam(required = false) String userId,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody StoreRequest request) {
        String resolvedUserId = resolveUserId(userId, authorization);
        if (resolvedUserId == null || resolvedUserId.isBlank()) {
            throw new IllegalArgumentException("User ID is required");
        }
        return ResponseEntity.ok(storeService.createStore(resolvedUserId, authorization, request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get store by ID", description = "Returns store details by ID")
    public ResponseEntity<Store> getStoreById(@PathVariable String id) {
        return storeService.getStoreById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get store by user ID", description = "Returns store for a specific user")
    public ResponseEntity<Store> getStoreByUserId(@PathVariable String userId) {
        return storeService.getStoreByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my-store")
    @Operation(summary = "Get current user's store", description = "Returns store for the authenticated user")
    public ResponseEntity<Store> getMyStore(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        String userId = resolveUserId(null, authorization);
        if (userId == null || userId.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return storeService.getStoreByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/username/{username}")
    @Operation(summary = "Get store by username", description = "Returns store by unique username")
    public ResponseEntity<Store> getStoreByUsername(@PathVariable String username) {
        return storeService.getStoreByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @Operation(summary = "Get all stores", description = "Returns list of all stores")
    public ResponseEntity<List<Store>> getAllStores() {
        return ResponseEntity.ok(storeService.getAllStores());
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get stores by status", description = "Returns stores filtered by status")
    public ResponseEntity<List<Store>> getStoresByStatus(@PathVariable String status) {
        return ResponseEntity.ok(storeService.getStoresByStatus(status));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update store", description = "Updates store information")
    public ResponseEntity<Store> updateStore(
            @PathVariable String id, 
            @RequestBody StoreRequest request) {
        return ResponseEntity.ok(storeService.updateStore(id, request));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update store status", description = "Updates store approval status")
    public ResponseEntity<Store> updateStoreStatus(
            @PathVariable String id, 
            @RequestParam String status) {
        return ResponseEntity.ok(storeService.updateStoreStatus(id, status));
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Update store activation", description = "Activates or deactivates a store")
    public ResponseEntity<Store> updateStoreActivation(
            @PathVariable String id, 
            @RequestParam Boolean isActive) {
        return ResponseEntity.ok(storeService.updateStoreActivation(id, isActive));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete store", description = "Deletes a store by ID")
    public ResponseEntity<Void> deleteStore(@PathVariable String id) {
        storeService.deleteStore(id);
        return ResponseEntity.noContent().build();
    }

    private String resolveUserId(String queryUserId, String authorization) {
        if (queryUserId != null && !queryUserId.isBlank()) {
            return queryUserId;
        }

        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return null;
        }

        try {
            String token = authorization.substring(7);
            String[] parts = token.split("\\.");
            if (parts.length < 2) {
                return null;
            }

            byte[] decodedPayload = Base64.getUrlDecoder().decode(parts[1]);
            JsonNode payload = objectMapper.readTree(new String(decodedPayload, StandardCharsets.UTF_8));
            JsonNode userIdNode = payload.get("userId");
            return userIdNode != null ? userIdNode.asText() : null;
        } catch (Exception ex) {
            return null;
        }
    }
}
