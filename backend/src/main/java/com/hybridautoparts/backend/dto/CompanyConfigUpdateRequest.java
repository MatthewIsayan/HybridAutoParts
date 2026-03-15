package com.hybridautoparts.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CompanyConfigUpdateRequest(
        @NotBlank(message = "Company name is required.")
        String companyName,
        @NotBlank(message = "Support email is required.")
        @Email(message = "Support email must be a valid email address.")
        String supportEmail,
        @NotBlank(message = "Phone is required.")
        String phone,
        @NotBlank(message = "Address line is required.")
        String addressLine,
        @NotBlank(message = "City is required.")
        String city,
        @NotBlank(message = "State is required.")
        String state,
        @NotBlank(message = "Postal code is required.")
        String postalCode,
        @NotBlank(message = "Hero headline is required.")
        String heroHeadline,
        @NotBlank(message = "Hero subheadline is required.")
        String heroSubheadline,
        @NotBlank(message = "About text is required.")
        String aboutText
) {
}
