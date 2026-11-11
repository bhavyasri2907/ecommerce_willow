package com.cara.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Sales report for a window of {@code rangeDays} days ending today. Every KPI
 * carries the value for the equally long window immediately before it, so the
 * client can show period-over-period change.
 */
public record AnalyticsDto(
        int rangeDays,
        LocalDate from,
        LocalDate to,
        Kpis kpis,
        List<DailyPoint> series,
        List<CategoryStat> byCategory,
        Map<String, Long> byStatus,
        Map<String, Long> byPayment,
        List<TopProduct> topProducts,
        List<CityStat> topCities
) {
    public record Kpi(BigDecimal value, BigDecimal previous) {}

    public record Kpis(Kpi revenue, Kpi orders, Kpi averageOrderValue, Kpi unitsSold, Kpi customers) {}

    public record DailyPoint(LocalDate date, BigDecimal revenue, long orders, long units) {}

    public record CategoryStat(String type, String label, BigDecimal revenue, long units) {}

    public record TopProduct(Long productId, String name, String typeLabel, String hex, String imageUrl,
                             long units, BigDecimal revenue) {}

    public record CityStat(String city, long orders, BigDecimal revenue) {}
}
