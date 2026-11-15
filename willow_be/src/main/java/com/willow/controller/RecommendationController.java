package com.willow.controller;

import com.willow.dto.request.RecommendationRequest;
import com.willow.service.CurationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final CurationService curationService;

    public RecommendationController(CurationService curationService) {
        this.curationService = curationService;
    }

    // Seller ticks a product "on" for a top (Seller Studio / dashboard Curated Picks)
    @PostMapping
    public ResponseEntity<Void> approve(@Valid @RequestBody RecommendationRequest req) {
        curationService.approve(req.topId(), req.pantsId());
        return ResponseEntity.ok().build();
    }

    // Seller unticks a product for a top
    @DeleteMapping
    public ResponseEntity<Void> revoke(@RequestParam Long topId, @RequestParam Long pantsId) {
        curationService.revoke(topId, pantsId);
        return ResponseEntity.ok().build();
    }
}
