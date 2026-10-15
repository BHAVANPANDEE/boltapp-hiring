package com.boltpay.dto;

import com.boltpay.models.User;

public record UserDto(
    Long id,
    String email,
    String firstName,
    String lastName
) {
    public static UserDto fromEntity(User user) {
        if (user == null) {
            return null;
        }
        return new UserDto(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName()
        );
    }
}
