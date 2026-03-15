package com.hybridautoparts.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record AdminPartRequest(
        @NotBlank(message = "SKU is required.")
        @Size(max = 64, message = "SKU must be 64 characters or fewer.")
        String sku,
        @NotBlank(message = "Title is required.")
        @Size(max = 160, message = "Title must be 160 characters or fewer.")
        String title,
        String description,
        @Size(max = 100, message = "Manufacturer must be 100 characters or fewer.")
        String manufacturer,
        @Size(max = 100, message = "Vehicle make must be 100 characters or fewer.")
        String vehicleMake,
        @Size(max = 100, message = "Vehicle model must be 100 characters or fewer.")
        String vehicleModel,
        @Size(max = 10, message = "Vehicle year must be 10 characters or fewer.")
        String vehicleYear,
        @NotBlank(message = "Condition is required.")
        @Size(max = 40, message = "Condition must be 40 characters or fewer.")
        String condition,
        @NotBlank(message = "Status is required.")
        @Size(max = 40, message = "Status must be 40 characters or fewer.")
        String status,
        @NotBlank(message = "Location code is required.")
        @Size(max = 40, message = "Location code must be 40 characters or fewer.")
        String locationCode,
        @NotNull(message = "Price is required.")
        @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than zero.")
        BigDecimal price,
        boolean featured
) {
}
