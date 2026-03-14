package com.gocart.productservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RatingRequest {
    private Integer rating;
    private String review;
    private String userId;
    private String productId;
    private String orderId;
}
