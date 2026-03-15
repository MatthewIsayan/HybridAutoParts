package com.hybridautoparts.backend.config;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.security.jwt")
public record JwtProperties(
        @NotBlank(message = "JWT secret is required.")
        @Size(min = 32, message = "JWT secret must be at least 32 characters long.")
        String secret,
        @NotNull(message = "JWT expiration is required.")
        Duration expiration
) {
}
