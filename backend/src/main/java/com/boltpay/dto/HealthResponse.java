package com.boltpay.dto;

import java.time.OffsetDateTime;

public record HealthResponse(
    String status,
    String service,
    OffsetDateTime timestamp
) {
    public static HealthResponse ok() {
        return new HealthResponse("ok", "BoltPay API", OffsetDateTime.now());
    }
}
