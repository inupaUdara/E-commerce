package com.gocart.orderservice.dto;

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
    private String name;
    private String status;
    private Boolean isActive;
}
