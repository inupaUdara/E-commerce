package com.gocart.userservice.controller;

import com.gocart.userservice.dto.AddressRequest;
import com.gocart.userservice.entity.Address;
import com.gocart.userservice.security.JwtService;
import com.gocart.userservice.service.AddressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
@Tag(name = "Address", description = "Address management APIs")
@SecurityRequirement(name = "Bearer Authentication")
public class AddressController {

    private final AddressService addressService;
    private final JwtService jwtService;

    private String extractUserId(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtService.extractUserId(token);
        }
        return null;
    }

    @PostMapping
    @Operation(summary = "Create address", description = "Creates a new address for the authenticated user")
    public ResponseEntity<Address> createAddress(@RequestBody AddressRequest request, HttpServletRequest httpRequest) {
        String userId = extractUserId(httpRequest);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(addressService.createAddress(userId, request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get address by ID", description = "Returns address details by ID")
    public ResponseEntity<Address> getAddressById(@PathVariable String id) {
        return addressService.getAddressById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user")
    @Operation(summary = "Get my addresses", description = "Returns all addresses for the authenticated user")
    public ResponseEntity<List<Address>> getMyAddresses(HttpServletRequest httpRequest) {
        String userId = extractUserId(httpRequest);
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(addressService.getAddressesByUserId(userId));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get user addresses", description = "Returns all addresses for a specific user")
    public ResponseEntity<List<Address>> getUserAddresses(@PathVariable String userId) {
        return ResponseEntity.ok(addressService.getAddressesByUserId(userId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update address", description = "Updates an existing address")
    public ResponseEntity<Address> updateAddress(@PathVariable String id, @RequestBody AddressRequest request) {
        return ResponseEntity.ok(addressService.updateAddress(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete address", description = "Deletes an address by ID")
    public ResponseEntity<Void> deleteAddress(@PathVariable String id) {
        addressService.deleteAddress(id);
        return ResponseEntity.noContent().build();
    }
}
