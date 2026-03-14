package com.gocart.storeservice.repository;

import com.gocart.storeservice.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface StoreRepository extends JpaRepository<Store, String> {
    Optional<Store> findByUserId(String userId);
    Optional<Store> findByUsername(String username);
    List<Store> findByStatus(String status);
    List<Store> findByIsActive(Boolean isActive);
}
