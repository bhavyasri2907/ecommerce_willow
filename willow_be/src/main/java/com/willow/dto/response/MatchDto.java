package com.willow.dto.response;

public record MatchDto(
        ProductDto product,
        String reason,
        int matchScore
) {}
