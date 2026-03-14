package com.gocart.productservice.service;

import com.gocart.productservice.dto.RatingRequest;
import com.gocart.productservice.entity.Rating;
import com.gocart.productservice.repository.RatingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final RatingRepository ratingRepository;

    public Rating createRating(RatingRequest request) {
        Rating rating = Rating.builder()
                .rating(request.getRating())
                .review(request.getReview())
                .userId(request.getUserId())
                .productId(request.getProductId())
                .orderId(request.getOrderId())
                .build();
        return ratingRepository.save(rating);
    }

    public Optional<Rating> getRatingById(String id) {
        return ratingRepository.findById(id);
    }

    public List<Rating> getRatingsByProductId(String productId) {
        return ratingRepository.findByProductId(productId);
    }

    public List<Rating> getRatingsByUserId(String userId) {
        return ratingRepository.findByUserId(userId);
    }

    public Rating updateRating(String id, RatingRequest request) {
        Rating rating = ratingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rating not found"));
        
        if (request.getRating() != null) rating.setRating(request.getRating());
        if (request.getReview() != null) rating.setReview(request.getReview());
        
        return ratingRepository.save(rating);
    }

    public void deleteRating(String id) {
        ratingRepository.deleteById(id);
    }
}
