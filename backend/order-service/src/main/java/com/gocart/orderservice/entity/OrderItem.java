package com.gocart.orderservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "order_item")
public class OrderItem {

    @EmbeddedId
    private OrderItemId id;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Double price;

    @ManyToOne
    @MapsId("orderId")
    @JoinColumn(name = "orderId")
    private Order order;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Embeddable
    public static class OrderItemId implements Serializable {
        private String orderId;
        private String productId;
    }
}
