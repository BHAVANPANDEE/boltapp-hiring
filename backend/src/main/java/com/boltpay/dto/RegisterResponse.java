package com.boltpay.dto;

public record RegisterResponse(
    boolean success,
    String message,
    String loginCode,
    UserDto user
) {
}
