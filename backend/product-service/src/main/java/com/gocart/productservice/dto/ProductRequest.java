package com.gocart.productservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {
    private String name;
    private String description;
    private Double mrp;
    private Double price;
    private List<String> images;
    private String category;
    private Boolean inStock;
    private String storeId;
}
