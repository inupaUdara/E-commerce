package com.gocart.orderservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
    @AttributeOverrides({
            @AttributeOverride(name = "orderId", column = @Column(name = "order_id")),
            @AttributeOverride(name = "productId", column = @Column(name = "product_id"))
    })
    private OrderItemId id;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Double price;

    @JsonIgnore
    @ManyToOne
    @MapsId("orderId")
    @JoinColumn(name = "order_id")
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
