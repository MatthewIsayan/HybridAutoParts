package com.hybridautoparts.backend.dto;

public record AdminUserDto(
        Long id,
        String username,
        String email,
        String displayName,
        String role,
        boolean active
) {
}
