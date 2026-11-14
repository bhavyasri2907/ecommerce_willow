package com.willow.dto.response;

import com.willow.entity.Product;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;

/**
 * Product as returned by the API. The first eight fields are the original
 * storefront contract and must stay stable; the rest serve the seller dashboard.
 */
public record ProductDto(
        Long id,
        String name,
        String type,
        String color,
        String hex,
        String style,
        BigDecimal price,
        String description,
        String typeLabel,
        String sku,
        String status,
        BigDecimal originalPrice,
        Integer discountPercent,
        int stock,
        String stockStatus,
        List<String> sizes,
        String imageUrl,
        long unitsSold,
        BigDecimal revenue,
        Instant createdAt,
        Instant updatedAt
) {
    public static final int DEFAULT_LOW_STOCK_THRESHOLD = 10;

    public static ProductDto from(Product p) {
        return of(p, ProductSales.NONE, DEFAULT_LOW_STOCK_THRESHOLD);
    }

    public static ProductDto of(Product p, ProductSales sales, int lowStockThreshold) {
        return new ProductDto(
                p.getId(), p.getName(), p.getType().name(), p.getColor(), p.getHex(), p.getStyle(),
                p.getPrice(), p.getDescription(),
                p.getType().getLabel(), p.getSku(), p.getStatus().name(),
                p.getOriginalPrice(), discountPercent(p),
                p.getStock(), stockStatus(p.getStock(), lowStockThreshold),
                parseSizes(p.getSizes()), p.getImageUrl(),
                sales.units(), sales.revenue(),
                p.getCreatedAt(), p.getUpdatedAt()
        );
    }

    public static String stockStatus(int stock, int lowStockThreshold) {
        if (stock <= 0) return "OUT_OF_STOCK";
        if (stock <= lowStockThreshold) return "LOW_STOCK";
        return "IN_STOCK";
    }

    public static List<String> parseSizes(String sizes) {
        if (sizes == null || sizes.isBlank()) return List.of();
        return Arrays.stream(sizes.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
    }

    private static Integer discountPercent(Product p) {
        BigDecimal original = p.getOriginalPrice();
        if (original == null || original.compareTo(p.getPrice()) <= 0) return null;
        return original.subtract(p.getPrice())
                .multiply(BigDecimal.valueOf(100))
                .divide(original, 0, RoundingMode.HALF_UP)
                .intValue();
    }
}
