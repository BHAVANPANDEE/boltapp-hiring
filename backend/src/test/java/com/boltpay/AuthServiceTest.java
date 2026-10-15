package com.boltpay;

import com.boltpay.dto.*;
import com.boltpay.exception.InvalidCredentialsException;
import com.boltpay.exception.UserAlreadyExistsException;
import com.boltpay.models.User;
import com.boltpay.repositories.UserRepository;
import com.boltpay.security.JwtUtil;
import com.boltpay.services.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User("test@example.com", "John", "Doe", "$2a$10$hashedcode");
        sampleUser.setId(1L);
    }

    @Test
    @DisplayName("Should successfully register a new user and generate a 6-digit code")
    void testRegisterSuccess() {
        when(userRepository.existsByEmailIgnoreCase("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$hashedcode");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);

        RegisterRequest request = new RegisterRequest("test@example.com", "John", "Doe");
        RegisterResponse response = authService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.success()).isTrue();
        assertThat(response.loginCode()).hasSize(6);
        assertThat(response.loginCode()).containsOnlyDigits();
        assertThat(response.user().email()).isEqualTo("test@example.com");

        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw UserAlreadyExistsException when registering existing email")
    void testRegisterDuplicateEmail() {
        when(userRepository.existsByEmailIgnoreCase("test@example.com")).thenReturn(true);

        RegisterRequest request = new RegisterRequest("test@example.com", "John", "Doe");

        assertThatThrownBy(() -> authService.register(request))
            .isInstanceOf(UserAlreadyExistsException.class)
            .hasMessageContaining("already exists");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should recognize registered user")
    void testRecognizeExistingEmail() {
        when(userRepository.existsByEmailIgnoreCase("test@example.com")).thenReturn(true);

        RecognizeResponse response = authService.recognize(new RecognizeRequest("test@example.com"));

        assertThat(response.recognized()).isTrue();
    }

    @Test
    @DisplayName("Should not recognize unregistered email")
    void testRecognizeUnknownEmail() {
        when(userRepository.existsByEmailIgnoreCase("unknown@example.com")).thenReturn(false);

        RecognizeResponse response = authService.recognize(new RecognizeRequest("unknown@example.com"));

        assertThat(response.recognized()).isFalse();
    }

    @Test
    @DisplayName("Should verify valid login code and return JWT token")
    void testVerifySuccess() {
        when(userRepository.findByEmailIgnoreCase("test@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("123456", sampleUser.getLoginCode())).thenReturn(true);
        when(jwtUtil.generateToken(sampleUser)).thenReturn("mock.jwt.token");

        VerifyResponse response = authService.verify(new VerifyRequest("test@example.com", "123456"));

        assertThat(response.authenticated()).isTrue();
        assertThat(response.token()).isEqualTo("mock.jwt.token");
        assertThat(response.user().firstName()).isEqualTo("John");
    }

    @Test
    @DisplayName("Should throw InvalidCredentialsException on invalid code")
    void testVerifyInvalidCode() {
        when(userRepository.findByEmailIgnoreCase("test@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("999999", sampleUser.getLoginCode())).thenReturn(false);

        assertThatThrownBy(() -> authService.verify(new VerifyRequest("test@example.com", "999999")))
            .isInstanceOf(InvalidCredentialsException.class)
            .hasMessageContaining("Invalid login code");
    }
}
