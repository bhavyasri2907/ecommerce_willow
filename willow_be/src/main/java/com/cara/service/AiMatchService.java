package com.cara.service;

import com.cara.dto.MatchDto;
import com.cara.dto.ProductDto;
import com.cara.model.Product;
import com.cara.model.Recommendation;
import com.cara.repository.RecommendationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

/**
 * Ranks and explains matches for a top. Deliberately only ever looks at
 * Recommendation rows a seller has already created (see Seller Studio) —
 * this service never pairs products the seller hasn't approved. Swap the
 * body of buildReason/buildScore for a real model call or attribute-based
 * scorer later without touching the controller or the approval boundary.
 */
@Service
public class AiMatchService {

    private static final Set<String> NEUTRALS = Set.of("Black", "White", "Beige", "Charcoal");

    private final RecommendationRepository recommendationRepository;

    public AiMatchService(RecommendationRepository recommendationRepository) {
        this.recommendationRepository = recommendationRepository;
    }

    @Transactional(readOnly = true)
    public List<MatchDto> matchesFor(Long topId) {
        List<Recommendation> approved = recommendationRepository.findByTopId(topId);

        return approved.stream()
                .map(r -> {
                    Product top = r.getTop();
                    Product pants = r.getPants();
                    return new MatchDto(
                            ProductDto.from(pants),
                            buildReason(top, pants),
                            buildScore(top, pants)
                    );
                })
                .sorted((a, b) -> Integer.compare(b.matchScore(), a.matchScore()))
                .toList();
    }

    private String buildReason(Product top, Product pants) {
        if ("Black".equals(pants.getColor())) {
            return "Chosen by the seller for a neutral base that lets the top lead.";
        }
        if (pants.getStyle() != null && pants.getStyle().equals(top.getStyle())) {
            return "Chosen by the seller for matching the top's " + top.getStyle().toLowerCase() + " formality.";
        }
        if ("White".equals(pants.getColor())) {
            return "Chosen by the seller for a clean, bright contrast against the top.";
        }
        if ("Beige".equals(pants.getColor()) || "Charcoal".equals(pants.getColor())) {
            return "Chosen by the seller for a tailored finish alongside the top.";
        }
        return "Chosen by the seller as a balanced pairing for the top.";
    }

    private int buildScore(Product top, Product pants) {
        int score = 70;
        if (pants.getStyle() != null && pants.getStyle().equals(top.getStyle())) {
            score += 18;
        }
        if (NEUTRALS.contains(pants.getColor())) {
            score += 8;
        }
        score += (int) ((top.getId() + pants.getId()) % 5);
        return Math.min(score, 97);
    }
}
