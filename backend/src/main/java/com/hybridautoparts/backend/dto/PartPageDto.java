package com.hybridautoparts.backend.dto;

import java.util.List;

public record PartPageDto(
        List<PartDto> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean first,
        boolean last,
        boolean empty
) {
}
