package com.cara.dto;

import java.util.List;
import java.util.Map;

/** Counts that drive the dashboard sidebar and the product status tabs. */
public record CatalogSummaryDto(
        long total,
        Map<String, Long> byStatus,
        List<CategoryCount> byType,
        long lowStock,
        long outOfStock,
        int lowStockThreshold
) {
    public record CategoryCount(String type, String label, long count) {}
}
