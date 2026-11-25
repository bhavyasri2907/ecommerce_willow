package com.willow.dto.response;

import java.util.List;

/**
 * Everything the dashboard's "Seller's Curated Picks" screen needs: each of the store's
 * products with the Curated Fit the seller has built for it.
 */
public record CurationBoardDto(List<Entry> products) {

    /** @param picks the fit, in the seller's order; may include products from other stores */
    public record Entry(ProductDto product, List<ProductDto> picks) {}
}
