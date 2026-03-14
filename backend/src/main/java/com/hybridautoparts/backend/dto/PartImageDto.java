package com.hybridautoparts.backend.dto;

public record PartImageDto(
        Long id,
        String url,
        String altText,
        int sortOrder,
        boolean placeholder
) {
}
