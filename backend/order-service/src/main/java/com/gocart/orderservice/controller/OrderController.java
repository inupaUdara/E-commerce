package com.gocart.orderservice.controller;

import com.gocart.orderservice.dto.OrderRequest;
import com.gocart.orderservice.dto.OrderUpdateRequest;
import com.gocart.orderservice.entity.Order;
import com.gocart.orderservice.entity.OrderStatus;
import com.gocart.orderservice.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(originPatterns = {"${CORS_ALLOWED_ORIGIN:http://localhost:3000}", "http://localhost:8080"})
@RequiredArgsConstructor
@Tag(name = "Order", description = "Order management endpoints")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Create a new order", description = "Creates a new order with validation of user, address, store, and products")
    public ResponseEntity<Order> createOrder(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody OrderRequest request) {
        Order order = orderService.createOrder(authorization, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @GetMapping
    @Operation(summary = "Get all orders", description = "Retrieves all orders in the system")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID", description = "Retrieves a specific order by its ID")
    public ResponseEntity<Order> getOrderById(@PathVariable String id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get orders by user ID", description = "Retrieves all orders for a specific user")
    public ResponseEntity<List<Order>> getOrdersByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
    }

    @GetMapping("/store/{storeId}")
    @Operation(summary = "Get orders by store ID", description = "Retrieves all orders for a specific store")
    public ResponseEntity<List<Order>> getOrdersByStoreId(@PathVariable String storeId) {
        return ResponseEntity.ok(orderService.getOrdersByStoreId(storeId));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get orders by status", description = "Retrieves all orders with a specific status")
    public ResponseEntity<List<Order>> getOrdersByStatus(@PathVariable OrderStatus status) {
        return ResponseEntity.ok(orderService.getOrdersByStatus(status));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update order", description = "Updates order status or payment status")
    public ResponseEntity<Order> updateOrder(@PathVariable String id, @RequestBody OrderUpdateRequest request) {
        return ResponseEntity.ok(orderService.updateOrder(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete order", description = "Deletes a specific order")
    public ResponseEntity<Void> deleteOrder(@PathVariable String id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}
