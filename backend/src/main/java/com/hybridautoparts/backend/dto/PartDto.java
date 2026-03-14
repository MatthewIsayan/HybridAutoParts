package com.hybridautoparts.backend.dto;

import java.math.BigDecimal;
import java.util.List;

public record PartDto(
        Long id,
        String sku,
        String title,
        String description,
        String manufacturer,
        String vehicleMake,
        String vehicleModel,
        String vehicleYear,
        String condition,
        String status,
        String locationCode,
        BigDecimal price,
        boolean featured,
        List<PartImageDto> images
) {
}
