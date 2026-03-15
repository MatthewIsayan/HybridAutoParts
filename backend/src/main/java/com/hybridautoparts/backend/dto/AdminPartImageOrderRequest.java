package com.hybridautoparts.backend.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record AdminPartImageOrderRequest(
        @NotEmpty(message = "Image order is required.")
        List<Long> imageIds
) {
}
