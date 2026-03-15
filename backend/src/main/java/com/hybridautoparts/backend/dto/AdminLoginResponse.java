package com.hybridautoparts.backend.dto;

import java.time.OffsetDateTime;

public record AdminLoginResponse(
        String tokenType,
        String accessToken,
        OffsetDateTime expiresAt,
        AdminUserDto adminUser
) {
}
