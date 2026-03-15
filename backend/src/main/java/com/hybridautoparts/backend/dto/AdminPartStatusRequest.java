package com.hybridautoparts.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record AdminPartStatusRequest(
        @NotBlank(message = "Status is required.")
        String status
) {
}
