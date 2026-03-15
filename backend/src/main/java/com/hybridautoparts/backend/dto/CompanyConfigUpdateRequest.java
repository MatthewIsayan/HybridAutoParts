package com.hybridautoparts.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CompanyConfigUpdateRequest(
        @NotBlank(message = "Company name is required.")
        @Size(max = 160, message = "Company name must be 160 characters or fewer.")
        String companyName,
        @NotBlank(message = "Support email is required.")
        @Email(message = "Support email must be a valid email address.")
        @Size(max = 160, message = "Support email must be 160 characters or fewer.")
        String supportEmail,
        @NotBlank(message = "Phone is required.")
        @Size(max = 40, message = "Phone must be 40 characters or fewer.")
        String phone,
        @NotBlank(message = "Address line is required.")
        @Size(max = 160, message = "Address line must be 160 characters or fewer.")
        String addressLine,
        @NotBlank(message = "City is required.")
        @Size(max = 100, message = "City must be 100 characters or fewer.")
        String city,
        @NotBlank(message = "State is required.")
        @Size(max = 100, message = "State must be 100 characters or fewer.")
        String state,
        @NotBlank(message = "Postal code is required.")
        @Size(max = 20, message = "Postal code must be 20 characters or fewer.")
        String postalCode,
        @NotBlank(message = "Hero headline is required.")
        @Size(max = 160, message = "Hero headline must be 160 characters or fewer.")
        String heroHeadline,
        @NotBlank(message = "Hero subheadline is required.")
        @Size(max = 255, message = "Hero subheadline must be 255 characters or fewer.")
        String heroSubheadline,
        @NotBlank(message = "About text is required.")
        String aboutText
) {
}
