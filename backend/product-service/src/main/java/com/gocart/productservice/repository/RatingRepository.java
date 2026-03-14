package com.gocart.productservice.repository;

import com.gocart.productservice.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, String> {
    List<Rating> findByProductId(String productId);
    List<Rating> findByUserId(String userId);
    Optional<Rating> findByUserIdAndProductIdAndOrderId(String userId, String productId, String orderId);
}
