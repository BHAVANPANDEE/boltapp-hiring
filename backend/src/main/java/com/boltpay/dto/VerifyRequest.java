package com.boltpay.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record VerifyRequest(
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    String email,

    @NotBlank(message = "Login code is required")
    @Pattern(regexp = "^\\d{6}$", message = "Login code must be exactly 6 numeric digits")
    String code
) {
}
