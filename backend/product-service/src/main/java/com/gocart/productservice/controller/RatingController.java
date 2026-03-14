package com.gocart.productservice.controller;

import com.gocart.productservice.dto.RatingRequest;
import com.gocart.productservice.entity.Rating;
import com.gocart.productservice.service.RatingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
@Tag(name = "Rating", description = "Product rating and review APIs")
public class RatingController {

    private final RatingService ratingService;

    @PostMapping
    @Operation(summary = "Create rating", description = "Creates a new product rating/review")
    public ResponseEntity<Rating> createRating(@RequestBody RatingRequest request) {
        return ResponseEntity.ok(ratingService.createRating(request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get rating by ID", description = "Returns rating details by ID")
    public ResponseEntity<Rating> getRatingById(@PathVariable String id) {
        return ratingService.getRatingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/product/{productId}")
    @Operation(summary = "Get ratings by product", description = "Returns all ratings for a specific product")
    public ResponseEntity<List<Rating>> getRatingsByProductId(@PathVariable String productId) {
        return ResponseEntity.ok(ratingService.getRatingsByProductId(productId));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get ratings by user", description = "Returns all ratings by a specific user")
    public ResponseEntity<List<Rating>> getRatingsByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(ratingService.getRatingsByUserId(userId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update rating", description = "Updates a rating/review")
    public ResponseEntity<Rating> updateRating(
            @PathVariable String id, 
            @RequestBody RatingRequest request) {
        return ResponseEntity.ok(ratingService.updateRating(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete rating", description = "Deletes a rating by ID")
    public ResponseEntity<Void> deleteRating(@PathVariable String id) {
        ratingService.deleteRating(id);
        return ResponseEntity.noContent().build();
    }
}
