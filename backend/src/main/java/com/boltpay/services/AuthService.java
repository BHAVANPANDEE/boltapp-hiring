package com.boltpay.services;

import com.boltpay.dto.*;
import com.boltpay.exception.InvalidCredentialsException;
import com.boltpay.exception.ResourceNotFoundException;
import com.boltpay.exception.UserAlreadyExistsException;
import com.boltpay.models.User;
import com.boltpay.repositories.UserRepository;
import com.boltpay.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        JwtUtil jwtUtil
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new UserAlreadyExistsException("An account with email " + email + " already exists.");
        }

        // Generate 6-digit numeric login code
        String rawCode = String.format("%06d", secureRandom.nextInt(1_000_000));
        String hashedCode = passwordEncoder.encode(rawCode);

        User user = new User(
            email,
            request.firstName().trim(),
            request.lastName().trim(),
            hashedCode
        );

        User savedUser = userRepository.save(user);
        log.info("Registered new user id={} with email={}", savedUser.getId(), savedUser.getEmail());

        // Return the plain code ONLY once here for the take-home display requirement
        return new RegisterResponse(
            true,
            "Registration successful! Save your 6-digit login code.",
            rawCode,
            UserDto.fromEntity(savedUser)
        );
    }

    @Transactional(readOnly = true)
    public RecognizeResponse recognize(RecognizeRequest request) {
        String email = request.email().trim().toLowerCase();
        boolean exists = userRepository.existsByEmailIgnoreCase(email);
        return new RecognizeResponse(exists);
    }

    @Transactional(readOnly = true)
    public VerifyResponse verify(VerifyRequest request) {
        String email = request.email().trim().toLowerCase();
        String code = request.code().trim();

        User user = userRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new InvalidCredentialsException("Invalid login code"));

        if (!passwordEncoder.matches(code, user.getLoginCode())) {
            log.warn("Failed OTP verification attempt for email={}", email);
            throw new InvalidCredentialsException("Invalid login code");
        }

        String token = jwtUtil.generateToken(user);
        log.info("User id={} successfully verified code and logged in", user.getId());

        return VerifyResponse.success(token, UserDto.fromEntity(user));
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return UserDto.fromEntity(user);
    }
}
