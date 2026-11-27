package com.willow.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** One product, size and quantity in a checkout. */
public record OrderLine(
        @NotNull(message = "Product is required") Long productId,
        @Size(max = 20) String size,
        @Min(value = 1, message = "Quantity must be at least 1") @Max(value = 20, message = "At most 20 of one item per order") int quantity
) {}
