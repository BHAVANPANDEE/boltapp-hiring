package com.boltpay.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record VerifyResponse(
    boolean authenticated,
    String token,
    UserDto user,
    String message
) {
    public static VerifyResponse success(String token, UserDto user) {
        return new VerifyResponse(true, token, user, null);
    }

    public static VerifyResponse failure(String message) {
        return new VerifyResponse(false, null, null, message);
    }
}
