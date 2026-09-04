package com.cara.dto;

public record MatchDto(
        ProductDto product,
        String reason,
        int matchScore
) {}
