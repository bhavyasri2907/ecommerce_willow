package com.willow.dto.response;

import java.math.BigDecimal;

public record InventorySummaryDto(
        long skuCount,
        long totalUnits,
        BigDecimal stockValue,
        long lowStock,
        long outOfStock,
        int lowStockThreshold
) {}
