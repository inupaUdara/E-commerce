package com.gocart.productservice.repository;

import com.gocart.productservice.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
    List<Product> findByStoreId(String storeId);
    List<Product> findByCategory(String category);
    List<Product> findByInStock(Boolean inStock);
}
