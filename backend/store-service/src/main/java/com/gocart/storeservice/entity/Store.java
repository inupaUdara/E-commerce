package com.gocart.storeservice.entity;

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
@Table(name = "store")
public class Store {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true, nullable = false)
    private String userId;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(unique = true, nullable = false)
    private String username;

    private String address;

    @Builder.Default
    private String status = "pending";

    @Builder.Default
    private Boolean isActive = false;

    @Column(columnDefinition = "TEXT")
    private String logo;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String contact;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
        if (status == null) status = "pending";
        if (isActive == null) isActive = false;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
