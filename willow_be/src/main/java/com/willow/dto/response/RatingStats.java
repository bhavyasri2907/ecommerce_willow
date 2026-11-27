package com.willow.dto.response;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** A product's average star rating (one decimal place; null when unreviewed) and how many reviews it has. */
public record RatingStats(BigDecimal average, long count) {

    public static final RatingStats NONE = new RatingStats(null, 0);

    public static RatingStats of(double average, long count) {
        if (count == 0) return NONE;
        return new RatingStats(BigDecimal.valueOf(average).setScale(1, RoundingMode.HALF_UP), count);
    }
}
