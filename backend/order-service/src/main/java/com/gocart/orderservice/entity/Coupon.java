package com.gocart.orderservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "coupon")
public class Coupon {

    @Id
    private String code;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private Double discount;

    @Column(nullable = false)
    private Boolean forNewUser;

    @Builder.Default
    private Boolean forMember = false;

    @Column(nullable = false)
    private Boolean isPublic;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (forMember == null) forMember = false;
    }
}
