package com.gocart.orderservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gocart.orderservice.client.ProductServiceClient;
import com.gocart.orderservice.client.StoreServiceClient;
import com.gocart.orderservice.client.UserServiceClient;
import com.gocart.orderservice.client.NotificationServiceClient;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CouponRepository couponRepository;
    private final UserServiceClient userServiceClient;
    private final StoreServiceClient storeServiceClient;
    private final ProductServiceClient productServiceClient;
    private final NotificationServiceClient notificationServiceClient;
    private final ObjectMapper objectMapper;

    @Value("${notification.internal-key:change-me}")
    private String notificationInternalKey;

    @Transactional
    public Order createOrder(String authorization, OrderRequest request) {
        if (authorization == null || authorization.isBlank() || !authorization.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authorization token is required");
        }

        // Validate user exists
        UserResponse currentUser;
        try {
            currentUser = userServiceClient.getCurrentUser(authorization);
            if (currentUser == null) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unable to identify the current user");
            }
            if (currentUser.getId() == null || !currentUser.getId().equals(request.getUserId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Order user does not match the authenticated user");
            }
        } catch (FeignException.Forbidden e) {
            log.error("User validation failed with forbidden response", e);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired token");
        } catch (FeignException.NotFound e) {
            log.error("Authenticated user lookup returned not found", e);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found");
        } catch (FeignException e) {
            log.error("Unable to validate user. status={}, content={}", e.status(), e.contentUTF8(), e);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Unable to validate user");
        }

        // Validate address exists
        try {
            AddressResponse address = userServiceClient.getAddressById(request.getAddressId(), authorization);
            if (address == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Address not found with id: " + request.getAddressId());
            }
            if (address.getUserId() != null && !address.getUserId().equals(request.getUserId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Selected address does not belong to the current user");
            }
        } catch (FeignException.NotFound e) {
            log.error("Address not found during order creation. addressId={}", request.getAddressId(), e);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Address not found with id: " + request.getAddressId());
        } catch (FeignException.Forbidden e) {
            log.error("Address validation failed with forbidden response", e);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired token");
        } catch (FeignException e) {
            log.error("Unable to validate address. status={}, content={}", e.status(), e.contentUTF8(), e);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Unable to validate address");
        }

        // Validate store exists
        StoreResponse targetStore;
        try {
            targetStore = storeServiceClient.getStoreById(request.getStoreId());
            if (targetStore == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Store not found with id: " + request.getStoreId());
            }
        } catch (FeignException.NotFound e) {
            log.error("Store not found during order creation. storeId={}", request.getStoreId(), e);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Store not found with id: " + request.getStoreId());
        } catch (FeignException e) {
            log.error("Unable to validate store. status={}, content={}", e.status(), e.contentUTF8(), e);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Unable to validate store");
        }

        // Validate all products exist and calculate total
        Double subtotal = 0.0;
        for (OrderRequest.OrderItemDTO item : request.getItems()) {
            try {
                ProductResponse product = productServiceClient.getProductById(item.getProductId());
                if (product == null) {
                    throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found with id: " + item.getProductId());
                }
                if (!product.getInStock()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product is out of stock: " + item.getProductId());
                }
                subtotal += item.getPrice() * item.getQuantity();
            } catch (FeignException.NotFound e) {
                log.error("Product not found during order creation. productId={}", item.getProductId(), e);
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found with id: " + item.getProductId());
            } catch (FeignException e) {
                log.error("Unable to validate product {}. status={}, content={}", item.getProductId(), e.status(), e.contentUTF8(), e);
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Unable to validate product: " + item.getProductId());
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

        publishOrderPlacedNotification(savedOrder, currentUser, targetStore);

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
        OrderStatus previousStatus = order.getStatus();
        
        if (request.getStatus() != null) {
            order.setStatus(request.getStatus());
        }
        
        if (request.getIsPaid() != null) {
            order.setIsPaid(request.getIsPaid());
        }
        
        order.setUpdatedAt(LocalDateTime.now());
        Order updatedOrder = orderRepository.save(order);

        if (request.getStatus() != null && previousStatus != request.getStatus()) {
            publishOrderStatusUpdateNotification(updatedOrder);
        }

        return updatedOrder;
    }

    @Transactional
    public void deleteOrder(String id) {
        Order order = getOrderById(id);
        orderRepository.delete(order);
    }

    private void publishOrderPlacedNotification(Order order, UserResponse customer, StoreResponse store) {
        try {
            if (store == null || store.getUserId() == null || store.getUserId().isBlank()) {
                return;
            }

            String customerName = customer != null && customer.getName() != null ? customer.getName() : "A customer";
            InternalNotificationRequest notification = InternalNotificationRequest.builder()
                    .recipientUserId(store.getUserId())
                    .recipientEmail(store.getEmail())
                    .type("ORDER_PLACED")
                    .title("New order received")
                    .message(customerName + " placed a new order (#" + order.getId() + ")")
                    .entityId(order.getId())
                    .build();

            notificationServiceClient.publishInternal(notificationInternalKey, notification);
        } catch (Exception ex) {
            log.warn("Failed to publish ORDER_PLACED notification for order {}: {}", order.getId(), ex.getMessage());
        }
    }

    private void publishOrderStatusUpdateNotification(Order order) {
        try {
            if (order.getUserId() == null || order.getUserId().isBlank()) {
                return;
            }

            InternalNotificationRequest notification = InternalNotificationRequest.builder()
                    .recipientUserId(order.getUserId())
                    .type("ORDER_STATUS_UPDATED")
                    .title("Order status updated")
                    .message("Your order #" + order.getId() + " is now " + order.getStatus())
                    .entityId(order.getId())
                    .build();

            notificationServiceClient.publishInternal(notificationInternalKey, notification);
        } catch (Exception ex) {
            log.warn("Failed to publish ORDER_STATUS_UPDATED notification for order {}: {}", order.getId(), ex.getMessage());
        }
    }
}
