package com.willow.controller;

import com.willow.dto.request.RecommendationRequest;
import com.willow.security.SellerContext;
import com.willow.service.CurationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** Approving and revoking outfit pairings on the dashboard's Curated Picks page. Signed-in sellers only. */
@RestController
@RequestMapping("/api/seller/recommendations")
public class RecommendationController {

    private final CurationService curationService;
    private final SellerContext seller;

    public RecommendationController(CurationService curationService, SellerContext seller) {
        this.curationService = curationService;
        this.seller = seller;
    }

    /** The seller ticks a product "on" for one of their tops. */
    @PostMapping
    public ResponseEntity<Void> approve(@Valid @RequestBody RecommendationRequest req) {
        curationService.approve(seller.storeId(), req.topId(), req.pantsId());
        return ResponseEntity.ok().build();
    }

    /** The seller unticks a product for one of their tops. */
    @DeleteMapping
    public ResponseEntity<Void> revoke(@RequestParam Long topId, @RequestParam Long pantsId) {
        curationService.revoke(seller.storeId(), topId, pantsId);
        return ResponseEntity.ok().build();
    }
}
