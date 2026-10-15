package com.boltpay.controllers;

import com.boltpay.dto.CheckoutRequest;
import com.boltpay.dto.CheckoutResponse;
import com.boltpay.security.UserPrincipal;
import com.boltpay.services.CheckoutService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkouts")
public class CheckoutController {

    private final CheckoutService checkoutService;

    public CheckoutController(CheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    @PostMapping
    public ResponseEntity<CheckoutResponse> submitCheckout(@Valid @RequestBody CheckoutRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long userId = null;

        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            userId = principal.id();
        }

        CheckoutResponse response = checkoutService.submitCheckout(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
