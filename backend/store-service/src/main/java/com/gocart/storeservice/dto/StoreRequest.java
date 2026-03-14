package com.gocart.storeservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreRequest {
    private String name;
    private String description;
    private String username;
    private String address;
    private String logo;
    private String email;
    private String contact;
}
