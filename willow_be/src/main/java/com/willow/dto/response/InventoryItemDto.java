package com.willow.dto.response;

import java.math.BigDecimal;

/**
 * Stock position for one product. Velocity is units sold per day over the last
 * 30 days; days of cover is how long current stock lasts at that pace (null if
 * the product has not sold recently).
 */
public record InventoryItemDto(
        ProductDto product,
        long unitsSold30d,
        double dailyVelocity,
        Integer daysOfCover,
        BigDecimal stockValue
) {}
