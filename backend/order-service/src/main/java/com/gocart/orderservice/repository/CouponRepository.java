package com.gocart.orderservice.repository;

import com.gocart.orderservice.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, String> {
    List<Coupon> findByIsPublic(Boolean isPublic);
    List<Coupon> findByForNewUser(Boolean forNewUser);
}
