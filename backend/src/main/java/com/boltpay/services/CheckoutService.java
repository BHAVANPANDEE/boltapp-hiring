package com.boltpay.services;

import com.boltpay.dto.CheckoutRequest;
import com.boltpay.dto.CheckoutResponse;
import com.boltpay.models.Checkout;
import com.boltpay.repositories.CheckoutRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CheckoutService {

    private static final Logger log = LoggerFactory.getLogger(CheckoutService.class);

    private final CheckoutRepository checkoutRepository;

    public CheckoutService(CheckoutRepository checkoutRepository) {
        this.checkoutRepository = checkoutRepository;
    }

    @Transactional
    public CheckoutResponse submitCheckout(CheckoutRequest request, Long authenticatedUserId) {
        String email = request.email().trim().toLowerCase();
        String phone = request.phone().trim();
        String address = request.shippingAddress().trim();

        Checkout checkout = new Checkout(
            authenticatedUserId,
            email,
            phone,
            address
        );

        Checkout saved = checkoutRepository.save(checkout);
        boolean isGuest = (authenticatedUserId == null);

        log.info("Checkout created id={}, userId={}, isGuest={}, email={}", 
            saved.getId(), saved.getUserId(), isGuest, email);

        return new CheckoutResponse(
            true,
            "Checkout submitted successfully",
            saved.getId(),
            saved.getUserId(),
            isGuest
        );
    }
}
