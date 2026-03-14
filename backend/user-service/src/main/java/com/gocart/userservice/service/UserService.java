package com.gocart.userservice.service;

import com.gocart.userservice.dto.UserResponse;
import com.gocart.userservice.entity.User;
import com.gocart.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .image(user.getImage())
                .role(user.getRole())
                .storeId(user.getStoreId())
                .build();
    }

    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .image(user.getImage())
                .role(user.getRole())
                .storeId(user.getStoreId())
                .build();
    }
}
