package com.gocart.orderservice.client;

import com.gocart.orderservice.dto.StoreResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "store-service", url = "${store.service.url}")
public interface StoreServiceClient {
    
    @GetMapping("/api/stores/{id}")
    StoreResponse getStoreById(@PathVariable("id") String id);
}
