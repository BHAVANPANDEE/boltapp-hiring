package com.boltpay;

import com.boltpay.dto.CheckoutRequest;
import com.boltpay.dto.RegisterRequest;
import com.boltpay.dto.RegisterResponse;
import com.boltpay.dto.VerifyRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BoltPayIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("GET /api/health should return ok")
    void testHealthCheck() throws Exception {
        mockMvc.perform(get("/api/health"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("ok"));
    }

    @Test
    @DisplayName("End-to-end user registration, recognition, verification, and checkout")
    void testEndToEndFlow() throws Exception {
        // 1. Register new user
        RegisterRequest registerReq = new RegisterRequest("alice@example.com", "Alice", "Wonder");
        MvcResult regResult = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerReq)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.loginCode").isString())
            .andExpect(jsonPath("$.loginCode", hasLength(6)))
            .andExpect(jsonPath("$.user.email").value("alice@example.com"))
            .andReturn();

        RegisterResponse regResponse = objectMapper.readValue(
            regResult.getResponse().getContentAsString(),
            RegisterResponse.class
        );
        String code = regResponse.loginCode();

        // 2. Register with duplicate email -> 409 Conflict
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerReq)))
            .andExpect(status().isConflict());

        // 3. Register with invalid email -> 400 Bad Request
        RegisterRequest invalidReq = new RegisterRequest("not-an-email", "", "");
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidReq)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.validationErrors").isMap());

        // 4. Recognize registered email -> recognized: true
        mockMvc.perform(post("/api/auth/recognize")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"alice@example.com\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.recognized").value(true));

        // 5. Recognize non-existent email -> recognized: false
        mockMvc.perform(post("/api/auth/recognize")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"nobody@example.com\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.recognized").value(false));

        // 6. Verify with incorrect code -> 401 Unauthorized
        VerifyRequest wrongCodeReq = new VerifyRequest("alice@example.com", "000000");
        mockMvc.perform(post("/api/auth/verify")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(wrongCodeReq)))
            .andExpect(status().isUnauthorized());

        // 7. Verify with correct code -> 200 OK with JWT token
        VerifyRequest correctReq = new VerifyRequest("alice@example.com", code);
        MvcResult verifyResult = mockMvc.perform(post("/api/auth/verify")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(correctReq)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.authenticated").value(true))
            .andExpect(jsonPath("$.token").isString())
            .andExpect(jsonPath("$.user.email").value("alice@example.com"))
            .andReturn();

        String token = objectMapper.readTree(verifyResult.getResponse().getContentAsString()).get("token").asText();

        // 8. GET /api/auth/me with Bearer token
        mockMvc.perform(get("/api/auth/me")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("alice@example.com"))
            .andExpect(jsonPath("$.firstName").value("Alice"));

        // 9. Authenticated checkout submission
        CheckoutRequest authCheckout = new CheckoutRequest("alice@example.com", "+1-555-0100", "77 Broadway, New York, NY");
        mockMvc.perform(post("/api/checkouts")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(authCheckout)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.guest").value(false))
            .andExpect(jsonPath("$.userId").isNumber());

        // 10. Guest checkout submission (no token / skipped login)
        CheckoutRequest guestCheckout = new CheckoutRequest("guest@example.com", "+1-555-0199", "12 Pine Street, Seattle, WA");
        mockMvc.perform(post("/api/checkouts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(guestCheckout)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.guest").value(true))
            .andExpect(jsonPath("$.userId").doesNotExist());
    }
}
