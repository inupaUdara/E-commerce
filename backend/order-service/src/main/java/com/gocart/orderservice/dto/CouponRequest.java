package com.gocart.orderservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponRequest {
    private String code;
    private String description;
    private Double discount;
    private Boolean forNewUser;
    private Boolean forMember;
    private Boolean isPublic;
    private LocalDateTime expiresAt;
}
