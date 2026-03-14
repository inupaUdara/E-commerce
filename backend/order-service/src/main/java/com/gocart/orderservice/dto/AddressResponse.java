package com.gocart.orderservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AddressResponse {
    private String id;
    private String name;
    private String email;
    private String street;
    private String city;
    private String state;
    private String zip;
    private String country;
    private String phone;
}
