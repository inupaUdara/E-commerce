package com.gocart.productservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StoreResponse {
    private String id;
    private String userId;
    private String name;
    private String description;
    private String username;
    private String address;
    private String status;
    private Boolean isActive;
    private String logo;
    private String email;
    private String contact;
}
