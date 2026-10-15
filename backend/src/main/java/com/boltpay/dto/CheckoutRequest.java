package com.boltpay.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CheckoutRequest(
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    String email,

    @NotBlank(message = "Phone number is required")
    @Size(min = 7, max = 50, message = "Phone number must be between 7 and 50 characters")
    String phone,

    @NotBlank(message = "Shipping address is required")
    @Size(min = 5, max = 1000, message = "Shipping address must be between 5 and 1000 characters")
    String shippingAddress
) {
}
