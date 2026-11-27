package com.willow.dto.response;

import java.math.BigDecimal;
import java.util.List;

/**
 * GET /api/products/{id}/reviews: the rating summary and one page of reviews.
 * {@code breakdown} always has five entries, 5 stars first.
 */
public record ProductReviewsDto(
        BigDecimal average,
        long count,
        List<StarCount> breakdown,
        PageResponse<ReviewDto> reviews
) {
    public record StarCount(int stars, long count) {}
}
