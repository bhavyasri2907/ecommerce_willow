package com.willow.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Body of PUT /api/account/reviews/product/{productId}: writes or replaces the shopper's review. */
public record ReviewRequest(
        @NotNull(message = "Choose a star rating")
        @Min(value = 1, message = "Choose a star rating")
        @Max(value = 5, message = "Ratings go up to 5 stars")
        Integer rating,

        @Size(max = 120, message = "Keep the headline under 120 characters")
        String title,

        @Size(max = 1000, message = "Keep your review under 1000 characters")
        String comment
) {}
