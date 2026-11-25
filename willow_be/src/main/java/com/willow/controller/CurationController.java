package com.willow.controller;

import com.willow.security.SellerContext;
import com.willow.dto.response.CurationBoardDto;
import com.willow.service.CurationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Read model for the Curated Picks screen. Approving and revoking pairings goes
 * through the existing POST/DELETE /api/recommendations endpoints.
 */
@RestController
@RequestMapping("/api/seller/curations")
public class CurationController {

    private final CurationService curationService;
    private final SellerContext seller;

    public CurationController(CurationService curationService, SellerContext seller) {
        this.curationService = curationService;
        this.seller = seller;
    }

    @GetMapping
    public CurationBoardDto board() {
        return curationService.board(seller.storeId());
    }
}
