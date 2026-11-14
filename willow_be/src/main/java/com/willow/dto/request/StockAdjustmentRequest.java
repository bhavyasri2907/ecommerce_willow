package com.willow.dto.request;

import com.willow.entity.StockMovementReason;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record StockAdjustmentRequest(
        @NotNull(message = "Quantity is required")
        @Min(value = -100000) @Max(value = 100000)
        Integer quantityChange,

        @NotNull(message = "Reason is required")
        StockMovementReason reason,

        @Size(max = 300) String note
) {}
