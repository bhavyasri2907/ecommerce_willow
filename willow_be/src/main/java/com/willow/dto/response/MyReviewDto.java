package com.willow.dto.response;

import com.willow.entity.Product;
import com.willow.entity.ProductStatus;
import com.willow.entity.Review;

import java.time.Instant;

/** One of the signed-in shopper's own reviews, with the product it is about (My Reviews, product page). */
public record MyReviewDto(
        Long id,
        ReviewableProductDto product,
        int rating,
        String title,
        String comment,
        boolean edited,
        Instant createdAt,
        Instant updatedAt
) {
    public static MyReviewDto from(Review r) {
        return new MyReviewDto(r.getId(), ReviewableProductDto.from(r.getProduct()), r.getRating(),
                r.getTitle(), r.getComment(), r.isEdited(), r.getCreatedAt(), r.getUpdatedAt());
    }

    /** Enough about a product to show it in the shopper's review lists. {@code live} is false once it is off sale. */
    public record ReviewableProductDto(
            Long id,
            String name,
            String type,
            String hex,
            String imageUrl,
            String brand,
            String storeName,
            boolean live
    ) {
        public static ReviewableProductDto from(Product p) {
            return new ReviewableProductDto(p.getId(), p.getName(), p.getType().name(), p.getHex(), p.getImageUrl(),
                    p.getBrand(), p.getStore().getStoreName(), p.getStatus() == ProductStatus.LIVE);
        }
    }
}
