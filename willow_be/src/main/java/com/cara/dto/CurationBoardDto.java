package com.cara.dto;

import java.util.List;

/**
 * Everything the "Seller's Curated Picks" screen needs: each top with the matches
 * the seller has approved (ranked by the AI assistant), and every product that
 * may be paired with a top.
 */
public record CurationBoardDto(List<TopCuration> tops, List<ProductDto> candidates) {

    public record TopCuration(ProductDto top, List<MatchDto> matches) {}
}
