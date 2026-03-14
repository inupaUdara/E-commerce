package com.gocart.storeservice.service;

import com.gocart.storeservice.client.UserServiceClient;
import com.gocart.storeservice.dto.StoreRequest;
import com.gocart.storeservice.dto.UserResponse;
import com.gocart.storeservice.entity.Store;
import com.gocart.storeservice.repository.StoreRepository;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class StoreService {

    private final StoreRepository storeRepository;
    private final UserServiceClient userServiceClient;

    public Store createStore(String userId, String authorization, StoreRequest request) {
        if (authorization == null || authorization.isBlank() || !authorization.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authorization token is required");
        }

        // Validate user exists by calling User Service
        try {
            UserResponse user = userServiceClient.getUserById(userId, authorization);
            log.info("Creating store for user: {}", user.getEmail());
        } catch (FeignException.NotFound e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        } catch (FeignException.Forbidden e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired token");
        } catch (FeignException e) {
            log.error("Error calling User Service: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Unable to validate user");
        }

        Store store = Store.builder()
                .userId(userId)
                .name(request.getName())
                .description(request.getDescription())
                .username(request.getUsername())
                .address(request.getAddress())
                .logo(request.getLogo())
                .email(request.getEmail())
                .contact(request.getContact())
                .build();
        return storeRepository.save(store);
    }

    public Optional<Store> getStoreById(String id) {
        return storeRepository.findById(id);
    }

    public Optional<Store> getStoreByUserId(String userId) {
        return storeRepository.findByUserId(userId);
    }

    public Optional<Store> getStoreByUsername(String username) {
        return storeRepository.findByUsername(username);
    }

    public List<Store> getAllStores() {
        return storeRepository.findAll();
    }

    public List<Store> getStoresByStatus(String status) {
        return storeRepository.findByStatus(status);
    }

    public Store updateStore(String id, StoreRequest request) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Store not found"));
        
        if (request.getName() != null) store.setName(request.getName());
        if (request.getDescription() != null) store.setDescription(request.getDescription());
        if (request.getUsername() != null) store.setUsername(request.getUsername());
        if (request.getAddress() != null) store.setAddress(request.getAddress());
        if (request.getLogo() != null) store.setLogo(request.getLogo());
        if (request.getEmail() != null) store.setEmail(request.getEmail());
        if (request.getContact() != null) store.setContact(request.getContact());
        
        return storeRepository.save(store);
    }

    public Store updateStoreStatus(String id, String status) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Store not found"));
        store.setStatus(status);
        return storeRepository.save(store);
    }

    public Store updateStoreActivation(String id, Boolean isActive) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Store not found"));
        store.setIsActive(isActive);
        return storeRepository.save(store);
    }

    public void deleteStore(String id) {
        storeRepository.deleteById(id);
    }
}
