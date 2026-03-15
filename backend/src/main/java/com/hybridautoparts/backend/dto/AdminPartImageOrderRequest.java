package com.hybridautoparts.backend.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record AdminPartImageOrderRequest(
        @NotEmpty(message = "Image order is required.")
        List<@NotNull(message = "Image id is required.") Long> imageIds
) {
}
