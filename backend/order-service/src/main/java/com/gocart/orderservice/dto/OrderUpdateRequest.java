package com.gocart.orderservice.dto;

import com.gocart.orderservice.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderUpdateRequest {
    private OrderStatus status;
    private Boolean isPaid;
}
