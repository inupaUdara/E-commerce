package com.gocart.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressRequest {
    private String name;
    private String email;
    private String street;
    private String city;
    private String state;
    private String zip;
    private String country;
    private String phone;
}
