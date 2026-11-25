package com.willow.dto.request;

import jakarta.validation.constraints.Size;

/**
 * Adds a product to a Curated Fit. Send either {@code link}, a product page link copied
 * from the Willow website, or {@code pickId} when the product is already known.
 */
public record AddPickRequest(@Size(max = 500) String link, Long pickId) {}
