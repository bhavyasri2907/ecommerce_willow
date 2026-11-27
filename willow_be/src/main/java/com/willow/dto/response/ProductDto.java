package com.willow.dto.response;

import com.willow.entity.Product;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;

/**
 * Product as returned by the API. The first eight fields are the original
 * storefront contract and must stay stable. {@code imageUrl} is the cover photo and
 * {@code images} the full gallery; {@code brand} may be null (show the store name).
 * {@code storeId} / {@code storeName} say which seller lists it.
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
        Instant updatedAt,
        String gender,
        String genderLabel,
        String brand,
        String material,
        List<String> images,
        Long storeId,
        String storeName,
        BigDecimal rating,
        long reviewCount
) {
    public static final int DEFAULT_LOW_STOCK_THRESHOLD = 10;

    public static ProductDto from(Product p) {
        return of(p, ProductSales.NONE, DEFAULT_LOW_STOCK_THRESHOLD, RatingStats.NONE);
    }

    public static ProductDto from(Product p, RatingStats rating) {
        return of(p, ProductSales.NONE, DEFAULT_LOW_STOCK_THRESHOLD, rating);
    }

    public static ProductDto of(Product p, ProductSales sales, int lowStockThreshold) {
        return of(p, sales, lowStockThreshold, RatingStats.NONE);
    }

    public static ProductDto of(Product p, ProductSales sales, int lowStockThreshold, RatingStats rating) {
        return new ProductDto(
                p.getId(), p.getName(), p.getType().name(), p.getColor(), p.getHex(), p.getStyle(),
                p.getPrice(), p.getDescription(),
                p.getType().getLabel(), p.getSku(), p.getStatus().name(),
                p.getOriginalPrice(), discountPercent(p),
                p.getStock(), stockStatus(p.getStock(), lowStockThreshold),
                parseSizes(p.getSizes()), p.getImageUrl(),
                sales.units(), sales.revenue(),
                p.getCreatedAt(), p.getUpdatedAt(),
                p.getGender().name(), p.getGender().getLabel(), p.getBrand(), p.getMaterial(),
                List.copyOf(p.getImages()),
                p.getStore().getId(), p.getStore().getStoreName(),
                rating.average(), rating.count()
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
        int percent = original.subtract(p.getPrice())
                .multiply(BigDecimal.valueOf(100))
                .divide(original, 0, RoundingMode.HALF_UP)
                .intValue();
        return percent > 0 ? percent : null; // a sub-1% markdown is not shown as "0% off"
    }
}
