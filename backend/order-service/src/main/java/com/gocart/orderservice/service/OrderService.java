package com.gocart.orderservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gocart.orderservice.client.ProductServiceClient;
import com.gocart.orderservice.client.StoreServiceClient;
import com.gocart.orderservice.client.UserServiceClient;
import com.gocart.orderservice.dto.*;
import com.gocart.orderservice.entity.Coupon;
import com.gocart.orderservice.entity.Order;
import com.gocart.orderservice.entity.OrderItem;
import com.gocart.orderservice.entity.OrderStatus;
import com.gocart.orderservice.repository.CouponRepository;
import com.gocart.orderservice.repository.OrderItemRepository;
import com.gocart.orderservice.repository.OrderRepository;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CouponRepository couponRepository;
    private final UserServiceClient userServiceClient;
    private final StoreServiceClient storeServiceClient;
    private final ProductServiceClient productServiceClient;
    private final ObjectMapper objectMapper;

    @Transactional
    public Order createOrder(OrderRequest request) {
        // Validate user exists
        try {
            UserResponse user = userServiceClient.getUserById(request.getUserId());
            if (user == null) {
                throw new RuntimeException("User not found with id: " + request.getUserId());
            }
        } catch (FeignException.NotFound e) {
            throw new RuntimeException("User not found with id: " + request.getUserId());
        }

        // Validate address exists
        try {
            AddressResponse address = userServiceClient.getAddressById(request.getAddressId());
            if (address == null) {
                throw new RuntimeException("Address not found with id: " + request.getAddressId());
            }
        } catch (FeignException.NotFound e) {
            throw new RuntimeException("Address not found with id: " + request.getAddressId());
        }

        // Validate store exists
        try {
            StoreResponse store = storeServiceClient.getStoreById(request.getStoreId());
            if (store == null) {
                throw new RuntimeException("Store not found with id: " + request.getStoreId());
            }
        } catch (FeignException.NotFound e) {
            throw new RuntimeException("Store not found with id: " + request.getStoreId());
        }

        // Validate all products exist and calculate total
        Double subtotal = 0.0;
        for (OrderRequest.OrderItemDTO item : request.getItems()) {
            try {
                ProductResponse product = productServiceClient.getProductById(item.getProductId());
                if (product == null) {
                    throw new RuntimeException("Product not found with id: " + item.getProductId());
                }
                if (!product.getInStock()) {
                    throw new RuntimeException("Product is out of stock: " + item.getProductId());
                }
                subtotal += item.getPrice() * item.getQuantity();
            } catch (FeignException.NotFound e) {
                throw new RuntimeException("Product not found with id: " + item.getProductId());
            }
        }

        // Apply coupon if provided
        Double discount = 0.0;
        Map<String, Object> couponData = new HashMap<>();
        boolean isCouponUsed = false;
        
        if (request.getCouponCode() != null && !request.getCouponCode().isEmpty()) {
            Coupon coupon = couponRepository.findById(request.getCouponCode()).orElse(null);
            if (coupon != null && coupon.getExpiresAt().isAfter(LocalDateTime.now())) {
                discount = subtotal * (coupon.getDiscount() / 100);
                couponData.put("code", coupon.getCode());
                couponData.put("discount", coupon.getDiscount());
                couponData.put("description", coupon.getDescription());
                isCouponUsed = true;
            }
        }

        Double total = subtotal - discount;

        // Create order
        String couponJson = "{}";
        try {
            couponJson = objectMapper.writeValueAsString(couponData);
        } catch (Exception e) {
            // Log error but continue with empty JSON
        }

        Order order = Order.builder()
                .userId(request.getUserId())
                .storeId(request.getStoreId())
                .addressId(request.getAddressId())
                .paymentMethod(request.getPaymentMethod())
                .total(total)
                .status(OrderStatus.ORDER_PLACED)
                .isPaid(false)
                .isCouponUsed(isCouponUsed)
                .coupon(couponJson)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Order savedOrder = orderRepository.save(order);

        // Create order items
        List<OrderItem> orderItems = new ArrayList<>();
        for (OrderRequest.OrderItemDTO itemDTO : request.getItems()) {
            OrderItem.OrderItemId itemId = new OrderItem.OrderItemId(savedOrder.getId(), itemDTO.getProductId());
            OrderItem orderItem = OrderItem.builder()
                    .id(itemId)
                    .order(savedOrder)
                    .quantity(itemDTO.getQuantity())
                    .price(itemDTO.getPrice())
                    .build();
            orderItems.add(orderItemRepository.save(orderItem));
        }

        savedOrder.setOrderItems(orderItems);
        return savedOrder;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order getOrderById(String id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
    }

    public List<Order> getOrdersByUserId(String userId) {
        return orderRepository.findByUserId(userId);
    }

    public List<Order> getOrdersByStoreId(String storeId) {
        return orderRepository.findByStoreId(storeId);
    }

    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    @Transactional
    public Order updateOrder(String id, OrderUpdateRequest request) {
        Order order = getOrderById(id);
        
        if (request.getStatus() != null) {
            order.setStatus(request.getStatus());
        }
        
        if (request.getIsPaid() != null) {
            order.setIsPaid(request.getIsPaid());
        }
        
        order.setUpdatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    @Transactional
    public void deleteOrder(String id) {
        Order order = getOrderById(id);
        orderRepository.delete(order);
    }
}
