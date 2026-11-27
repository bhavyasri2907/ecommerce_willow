package com.willow.dto.response;

/**
 * GET /api/account/reviews/product/{productId}: whether the signed-in shopper may review the
 * product (they need a delivered order for it) and their review, if they wrote one.
 */
public record ReviewStatusDto(boolean canReview, MyReviewDto review) {}
