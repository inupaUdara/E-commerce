package com.gocart.orderservice.client;

import com.gocart.orderservice.dto.ProductResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "product-service", url = "${product.service.url}")
public interface ProductServiceClient {
    
    @GetMapping("/api/products/{id}")
    ProductResponse getProductById(@PathVariable("id") String id);
}
