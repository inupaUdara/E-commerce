package com.gocart.userservice.service;

import com.gocart.userservice.client.StoreServiceClient;
import com.gocart.userservice.dto.UserResponse;
import com.gocart.userservice.entity.User;
import com.gocart.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
        private final StoreServiceClient storeServiceClient;

    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

                return toResponse(user);
    }

    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

                return toResponse(user);
        }

        public UserResponse followStore(String email, String storeId) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                validateStoreCanBeFollowed(storeId);

                List<String> followedStoreIds = user.getFollowedStoreIds() == null
                                ? new ArrayList<>()
                                : new ArrayList<>(user.getFollowedStoreIds());

                if (!followedStoreIds.contains(storeId)) {
                        followedStoreIds.add(storeId);
                        user.setFollowedStoreIds(followedStoreIds);
                        user = userRepository.save(user);
                }

                return toResponse(user);
        }

        public UserResponse unfollowStore(String email, String storeId) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                List<String> followedStoreIds = user.getFollowedStoreIds() == null
                                ? new ArrayList<>()
                                : new ArrayList<>(user.getFollowedStoreIds());

                if (followedStoreIds.remove(storeId)) {
                        user.setFollowedStoreIds(followedStoreIds);
                        user = userRepository.save(user);
                }

                return toResponse(user);
        }

        public List<String> getFollowedStoreIds(String email) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                return user.getFollowedStoreIds() == null ? List.of() : List.copyOf(user.getFollowedStoreIds());
        }

        public long countFollowers(String storeId) {
                return userRepository.findAll().stream()
                                .filter(u -> u.getFollowedStoreIds() != null && u.getFollowedStoreIds().contains(storeId))
                                .count();
        }

        private void validateStoreCanBeFollowed(String storeId) {
                if (storeId == null || storeId.isBlank()) {
                        throw new IllegalArgumentException("Store ID is required");
                }

                var store = storeServiceClient.getStoreById(storeId);
                if (store == null || store.getId() == null) {
                        throw new RuntimeException("Store not found");
                }

                boolean active = Boolean.TRUE.equals(store.getIsActive());
                boolean approved = "approved".equalsIgnoreCase(String.valueOf(store.getStatus()).toLowerCase(Locale.ROOT));

                if (!active || !approved) {
                        throw new IllegalArgumentException("Only active approved stores can be followed");
                }
        }

        private UserResponse toResponse(User user) {
                return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .image(user.getImage())
                .role(user.getRole())
                .storeId(user.getStoreId())
                                .followedStoreIds(user.getFollowedStoreIds() == null ? List.of() : List.copyOf(user.getFollowedStoreIds()))
                .build();
    }
}
