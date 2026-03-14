package com.gocart.productservice.service;

import com.gocart.productservice.client.StoreServiceClient;
import com.gocart.productservice.dto.ProductRequest;
import com.gocart.productservice.dto.StoreResponse;
import com.gocart.productservice.entity.Product;
import com.gocart.productservice.repository.ProductRepository;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final StoreServiceClient storeServiceClient;

    public Product createProduct(ProductRequest request) {
        // Validate store exists by calling Store Service
        try {
            StoreResponse store = storeServiceClient.getStoreById(request.getStoreId());
            log.info("Creating product for store: {}", store.getName());
        } catch (FeignException.NotFound e) {
            throw new RuntimeException("Store not found");
        } catch (FeignException e) {
            log.error("Error calling Store Service: {}", e.getMessage());
            throw new RuntimeException("Unable to validate store");
        }

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .mrp(request.getMrp())
                .price(request.getPrice())
                .images(request.getImages())
                .category(request.getCategory())
                .inStock(request.getInStock())
                .storeId(request.getStoreId())
                .build();
        return productRepository.save(product);
    }

    public Optional<Product> getProductById(String id) {
        return productRepository.findById(id);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getProductsByStoreId(String storeId) {
        return productRepository.findByStoreId(storeId);
    }

    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategory(category);
    }

    public Product updateProduct(String id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (request.getName() != null) product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getMrp() != null) product.setMrp(request.getMrp());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getImages() != null) product.setImages(request.getImages());
        if (request.getCategory() != null) product.setCategory(request.getCategory());
        if (request.getInStock() != null) product.setInStock(request.getInStock());
        
        return productRepository.save(product);
    }

    public void deleteProduct(String id) {
        productRepository.deleteById(id);
    }
}
