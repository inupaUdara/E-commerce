package com.gocart.orderservice.repository;

import com.gocart.orderservice.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findByUserId(String userId);
    List<Order> findByStoreId(String storeId);
    List<Order> findByStatus(com.gocart.orderservice.entity.OrderStatus status);
}
