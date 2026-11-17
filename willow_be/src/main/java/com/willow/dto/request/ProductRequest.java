package com.willow.dto.request;

import com.willow.entity.ProductGender;
import com.willow.entity.ProductStatus;
import com.willow.entity.ProductType;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

/** Payload for creating or fully updating a product from the dashboard. */
public record ProductRequest(
        @NotBlank(message = "Product name is required")
        @Size(max = 120, message = "Name must be at most 120 characters")
        String name,

        @NotNull(message = "Category is required")
        ProductType type,

        ProductStatus status,

        /** Who it is for; UNISEX when omitted. */
        ProductGender gender,

        @Size(max = 80, message = "Brand must be at most 80 characters")
        String brand,

        @Size(max = 120, message = "Material must be at most 120 characters")
        String material,

        @Size(max = 40, message = "SKU must be at most 40 characters")
        @Pattern(regexp = "^$|^[A-Za-z0-9-]+$", message = "SKU may only contain letters, numbers and dashes")
        String sku,

        @Size(max = 60) String color,

        @Pattern(regexp = "^$|^#[0-9A-Fa-f]{6}$", message = "Colour must be a hex value like #8C2D42")
        String hex,

        @Size(max = 40) String style,

        @NotNull(message = "Price is required")
        @DecimalMin(value = "1", message = "Price must be at least 1")
        @Digits(integer = 10, fraction = 2)
        BigDecimal price,

        @DecimalMin(value = "0", message = "Compare-at price cannot be negative")
        @Digits(integer = 10, fraction = 2)
        BigDecimal originalPrice,

        @NotNull(message = "Stock is required")
        @Min(value = 0, message = "Stock cannot be negative")
        @Max(value = 100000, message = "Stock looks too high")
        Integer stock,

        @Size(max = 12, message = "At most 12 sizes")
        List<@NotBlank @Size(max = 10) String> sizes,

        /** Photos in display order; the first is the cover. */
        @Size(max = 8, message = "At most 8 photos")
        List<@NotBlank @Size(max = 500) @Pattern(regexp = "^https?://.+", message = "Each photo must be an http(s) URL") String> images,

        /** Older clients send a single image instead of {@code images}; still accepted. */
        @Size(max = 500)
        @Pattern(regexp = "^$|^https?://.+", message = "Image must be an http(s) URL")
        String imageUrl,

        @Size(max = 1000, message = "Description must be at most 1000 characters")
        String description
) {}
