package com.hybridautoparts.backend.dto;

import java.util.List;

public record BootstrapResponseDto(
        CompanyConfigDto company,
        List<PartDto> featuredParts
) {
}
