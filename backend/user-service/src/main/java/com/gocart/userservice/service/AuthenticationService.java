package com.gocart.userservice.service;

import com.gocart.userservice.dto.AuthenticationRequest;
import com.gocart.userservice.dto.AuthenticationResponse;
import com.gocart.userservice.dto.RegisterRequest;
import com.gocart.userservice.entity.Role;
import com.gocart.userservice.entity.User;
import com.gocart.userservice.repository.UserRepository;
import com.gocart.userservice.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request) {
        Role assignedRole = request.getRole() != null ? request.getRole() : Role.USER;

        var user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .image("https://via.placeholder.com/150")
                .role(assignedRole)
                .build();
        repository.save(user);
        
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("role", user.getRole().name());
        
        var jwtToken = jwtService.generateToken(claims, org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build());
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));
        var user = repository.findByEmail(request.getEmail())
                .orElseThrow();
        
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("role", user.getRole().name());
        
        var jwtToken = jwtService.generateToken(claims, org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build());
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }
}
