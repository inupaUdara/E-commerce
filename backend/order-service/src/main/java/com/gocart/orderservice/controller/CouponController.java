package com.gocart.orderservice.controller;

import com.gocart.orderservice.dto.CouponRequest;
import com.gocart.orderservice.entity.Coupon;
import com.gocart.orderservice.service.CouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
@Tag(name = "Coupon", description = "Coupon management endpoints")
public class CouponController {

    private final CouponService couponService;

    @PostMapping
    @Operation(summary = "Create a new coupon", description = "Creates a new discount coupon")
    public ResponseEntity<Coupon> createCoupon(@RequestBody CouponRequest request) {
        Coupon coupon = couponService.createCoupon(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(coupon);
    }

    @GetMapping
    @Operation(summary = "Get all coupons", description = "Retrieves all coupons in the system")
    public ResponseEntity<List<Coupon>> getAllCoupons() {
        return ResponseEntity.ok(couponService.getAllCoupons());
    }

    @GetMapping("/{code}")
    @Operation(summary = "Get coupon by code", description = "Retrieves a specific coupon by its code")
    public ResponseEntity<Coupon> getCouponByCode(@PathVariable String code) {
        return ResponseEntity.ok(couponService.getCouponByCode(code));
    }

    @GetMapping("/public")
    @Operation(summary = "Get public coupons", description = "Retrieves all publicly available coupons")
    public ResponseEntity<List<Coupon>> getPublicCoupons() {
        return ResponseEntity.ok(couponService.getPublicCoupons());
    }

    @GetMapping("/new-users")
    @Operation(summary = "Get new user coupons", description = "Retrieves coupons available for new users")
    public ResponseEntity<List<Coupon>> getCouponsForNewUsers() {
        return ResponseEntity.ok(couponService.getCouponsForNewUsers());
    }

    @GetMapping("/{code}/validate")
    @Operation(summary = "Validate coupon", description = "Checks if a coupon is valid and not expired")
    public ResponseEntity<Boolean> validateCoupon(@PathVariable String code) {
        return ResponseEntity.ok(couponService.isValidCoupon(code));
    }

    @PatchMapping("/{code}")
    @Operation(summary = "Update coupon", description = "Updates an existing coupon")
    public ResponseEntity<Coupon> updateCoupon(@PathVariable String code, @RequestBody CouponRequest request) {
        return ResponseEntity.ok(couponService.updateCoupon(code, request));
    }

    @DeleteMapping("/{code}")
    @Operation(summary = "Delete coupon", description = "Deletes a specific coupon")
    public ResponseEntity<Void> deleteCoupon(@PathVariable String code) {
        couponService.deleteCoupon(code);
        return ResponseEntity.noContent().build();
    }
}
