package com.cara.controller;

import com.cara.dto.RecommendationRequest;
import com.cara.model.Product;
import com.cara.model.Recommendation;
import com.cara.repository.ProductRepository;
import com.cara.repository.RecommendationRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationRepository recommendationRepository;
    private final ProductRepository productRepository;

    public RecommendationController(RecommendationRepository recommendationRepository,
                                     ProductRepository productRepository) {
        this.recommendationRepository = recommendationRepository;
        this.productRepository = productRepository;
    }

    // Seller ticks a pant "on" for a top in Seller Studio
    @PostMapping
    public ResponseEntity<Void> approve(@Valid @RequestBody RecommendationRequest req) {
        if (recommendationRepository.findByTopIdAndPantsId(req.topId(), req.pantsId()).isPresent()) {
            return ResponseEntity.ok().build();
        }
        Product top = productRepository.findById(req.topId())
                .orElseThrow(() -> new IllegalArgumentException("No top with id " + req.topId()));
        Product pants = productRepository.findById(req.pantsId())
                .orElseThrow(() -> new IllegalArgumentException("No pants with id " + req.pantsId()));
        recommendationRepository.save(new Recommendation(top, pants));
        return ResponseEntity.ok().build();
    }

    // Seller unticks a pant for a top
    @DeleteMapping
    @Transactional
    public ResponseEntity<Void> revoke(@RequestParam Long topId, @RequestParam Long pantsId) {
        recommendationRepository.deleteByTopIdAndPantsId(topId, pantsId);
        return ResponseEntity.ok().build();
    }
}
