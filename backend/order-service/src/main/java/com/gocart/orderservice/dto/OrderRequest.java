package com.gocart.orderservice.dto;

import com.gocart.orderservice.entity.OrderStatus;
import com.gocart.orderservice.entity.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {
    private String userId;
    private String storeId;
    private String addressId;
    private PaymentMethod paymentMethod;
    private String couponCode;
    private List<OrderItemDTO> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDTO {
        private String productId;
        private Integer quantity;
        private Double price;
    }
}
