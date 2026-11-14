package com.willow.dto.response;

import com.willow.entity.Product;
import com.willow.entity.StockMovement;

import java.time.Instant;

public record StockMovementDto(
        Long id,
        Long productId,
        String productName,
        String sku,
        String hex,
        String imageUrl,
        int quantityChange,
        int balanceAfter,
        String reason,
        String note,
        Instant createdAt
) {
    public static StockMovementDto from(StockMovement m) {
        Product p = m.getProduct();
        return new StockMovementDto(m.getId(), p.getId(), p.getName(), p.getSku(), p.getHex(), p.getImageUrl(),
                m.getQuantityChange(), m.getBalanceAfter(), m.getReason().name(), m.getNote(), m.getCreatedAt());
    }
}
