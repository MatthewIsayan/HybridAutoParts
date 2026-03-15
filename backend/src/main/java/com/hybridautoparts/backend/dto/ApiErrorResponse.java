package com.hybridautoparts.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record ApiErrorResponse(
        String error,
        String message,
        Map<String, String> fieldErrors,
        String requestId
) {
}
