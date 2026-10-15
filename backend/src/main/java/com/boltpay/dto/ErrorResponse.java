package com.boltpay.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.OffsetDateTime;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
    OffsetDateTime timestamp,
    int status,
    String error,
    String message,
    Map<String, String> validationErrors
) {
    public static ErrorResponse of(int status, String error, String message) {
        return new ErrorResponse(OffsetDateTime.now(), status, error, message, null);
    }

    public static ErrorResponse validation(int status, String error, String message, Map<String, String> validationErrors) {
        return new ErrorResponse(OffsetDateTime.now(), status, error, message, validationErrors);
    }
}
