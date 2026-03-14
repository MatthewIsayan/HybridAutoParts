package com.hybridautoparts.backend.dto;

public record CompanyConfigDto(
        Long id,
        String companyName,
        String supportEmail,
        String phone,
        String addressLine,
        String city,
        String state,
        String postalCode,
        String heroHeadline,
        String heroSubheadline,
        String aboutText
) {
}
