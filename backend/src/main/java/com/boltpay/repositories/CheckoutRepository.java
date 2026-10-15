package com.boltpay.repositories;

import com.boltpay.models.Checkout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CheckoutRepository extends JpaRepository<Checkout, Long> {
    List<Checkout> findByUserId(Long userId);
    List<Checkout> findByEmailIgnoreCase(String email);
}
