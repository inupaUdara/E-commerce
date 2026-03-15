package com.gocart.userservice.dto;

import com.gocart.userservice.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private String id;
    private String name;
    private String email;
    private String image;
    private Role role;
    private String storeId;
    private List<String> followedStoreIds;
}
