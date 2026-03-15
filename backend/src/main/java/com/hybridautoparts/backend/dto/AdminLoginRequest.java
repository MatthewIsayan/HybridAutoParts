package com.hybridautoparts.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminLoginRequest(
        @NotBlank(message = "Username is required.")
        @Size(max = 80, message = "Username must be 80 characters or fewer.")
        String username,
        @NotBlank(message = "Password is required.")
        @Size(max = 255, message = "Password must be 255 characters or fewer.")
        String password
) {
}
