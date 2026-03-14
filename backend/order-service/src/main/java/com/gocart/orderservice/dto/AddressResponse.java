package com.gocart.orderservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AddressResponse {
    private String id;
    private String userId;
    private String name;
    private String email;
    private String street;
    private String city;
    private String state;
    private String zip;
    private String country;
    private String phone;
}
