package com.gocart.orderservice.service;

import com.gocart.orderservice.dto.CouponRequest;
import com.gocart.orderservice.entity.Coupon;
import com.gocart.orderservice.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    @Transactional
    public Coupon createCoupon(CouponRequest request) {
        if (couponRepository.existsById(request.getCode())) {
            throw new RuntimeException("Coupon already exists with code: " + request.getCode());
        }

        Coupon coupon = Coupon.builder()
                .code(request.getCode())
                .description(request.getDescription())
                .discount(request.getDiscount())
                .forNewUser(request.getForNewUser())
                .forMember(request.getForMember() != null ? request.getForMember() : false)
                .isPublic(request.getIsPublic())
                .expiresAt(request.getExpiresAt())
                .createdAt(LocalDateTime.now())
                .build();

        return couponRepository.save(coupon);
    }

    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    public Coupon getCouponByCode(String code) {
        return couponRepository.findById(code)
                .orElseThrow(() -> new RuntimeException("Coupon not found with code: " + code));
    }

    public List<Coupon> getPublicCoupons() {
        return couponRepository.findByIsPublic(true);
    }

    public List<Coupon> getCouponsForNewUsers() {
        return couponRepository.findByForNewUser(true);
    }

    public boolean isValidCoupon(String code) {
        Coupon coupon = couponRepository.findById(code).orElse(null);
        if (coupon == null) {
            return false;
        }
        return coupon.getExpiresAt().isAfter(LocalDateTime.now());
    }

    @Transactional
    public Coupon updateCoupon(String code, CouponRequest request) {
        Coupon coupon = getCouponByCode(code);

        if (request.getDescription() != null) {
            coupon.setDescription(request.getDescription());
        }
        if (request.getDiscount() != null) {
            coupon.setDiscount(request.getDiscount());
        }
        if (request.getForNewUser() != null) {
            coupon.setForNewUser(request.getForNewUser());
        }
        if (request.getForMember() != null) {
            coupon.setForMember(request.getForMember());
        }
        if (request.getIsPublic() != null) {
            coupon.setIsPublic(request.getIsPublic());
        }
        if (request.getExpiresAt() != null) {
            coupon.setExpiresAt(request.getExpiresAt());
        }

        return couponRepository.save(coupon);
    }

    @Transactional
    public void deleteCoupon(String code) {
        Coupon coupon = getCouponByCode(code);
        couponRepository.delete(coupon);
    }
}
