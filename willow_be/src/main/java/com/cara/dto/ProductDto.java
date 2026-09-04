package com.cara.dto;

import com.cara.model.Product;

import java.math.BigDecimal;

public record ProductDto(
        Long id,
        String name,
        String type,
        String color,
        String hex,
        String style,
        BigDecimal price,
        String description
) {
    public static ProductDto from(Product p) {
        return new ProductDto(
                p.getId(), p.getName(), p.getType().name(), p.getColor(),
                p.getHex(), p.getStyle(), p.getPrice(), p.getDescription()
        );
    }
}
