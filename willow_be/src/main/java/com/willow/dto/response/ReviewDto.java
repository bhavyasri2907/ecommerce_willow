package com.willow.dto.response;

import com.willow.entity.Review;

import java.time.Instant;

/**
 * A review as shoppers see it on a product page. The author is shown as first name and last
 * initial ("Bhavya S."); every review comes from a delivered order, so all are verified purchases.
 */
public record ReviewDto(
        Long id,
        int rating,
        String title,
        String comment,
        String authorName,
        boolean edited,
        Instant createdAt,
        Instant updatedAt
) {
    public static ReviewDto from(Review r) {
        return new ReviewDto(r.getId(), r.getRating(), r.getTitle(), r.getComment(),
                displayName(r.getCustomer().getFullName()), r.isEdited(), r.getCreatedAt(), r.getUpdatedAt());
    }

    static String displayName(String fullName) {
        String[] parts = fullName.trim().split("\\s+");
        if (parts.length == 1) return parts[0];
        return parts[0] + " " + Character.toUpperCase(parts[parts.length - 1].charAt(0)) + ".";
    }
}
