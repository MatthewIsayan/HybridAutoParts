package com.hybridautoparts.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record AdminPartRequest(
        @NotBlank(message = "SKU is required.")
        String sku,
        @NotBlank(message = "Title is required.")
        String title,
        String description,
        String manufacturer,
        String vehicleMake,
        String vehicleModel,
        String vehicleYear,
        @NotBlank(message = "Condition is required.")
        String condition,
        @NotBlank(message = "Status is required.")
        String status,
        @NotBlank(message = "Location code is required.")
        String locationCode,
        @NotNull(message = "Price is required.")
        @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than zero.")
        BigDecimal price,
        boolean featured
) {
}
