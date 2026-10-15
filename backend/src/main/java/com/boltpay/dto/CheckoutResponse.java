package com.boltpay.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record CheckoutResponse(
    boolean success,
    String message,
    Long checkoutId,
    Long userId,
    boolean guest
) {
}
