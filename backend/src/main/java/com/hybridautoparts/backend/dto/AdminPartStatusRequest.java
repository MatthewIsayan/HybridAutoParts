package com.hybridautoparts.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminPartStatusRequest(
        @NotBlank(message = "Status is required.")
        @Size(max = 40, message = "Status must be 40 characters or fewer.")
        String status
) {
}
