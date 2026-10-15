package com.boltpay.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RecognizeRequest(
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    String email
) {
}
