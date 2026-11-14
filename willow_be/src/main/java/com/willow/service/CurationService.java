package com.willow.service;

import com.willow.mapper.ProductMapper;
import com.willow.dto.response.CurationBoardDto;
import com.willow.dto.response.ProductDto;
import com.willow.event.LiveEvent;
import com.willow.event.LiveEventPublisher;
import com.willow.entity.Product;
import com.willow.entity.ProductStatus;
import com.willow.entity.ProductType;
import com.willow.entity.Recommendation;
import com.willow.repository.ProductRepository;
import com.willow.repository.RecommendationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

/**
 * Seller-approved pairings ("Seller's Curated Picks"). A pairing always links a
 * top to a non-top product; the AI assistant may only rank pairings that exist here.
 */
@Service
public class CurationService {

    private final RecommendationRepository recommendationRepository;
    private final ProductRepository productRepository;
    private final AiMatchService aiMatchService;
    private final ProductMapper mapper;
    private final LiveEventPublisher events;

    public CurationService(RecommendationRepository recommendationRepository,
                           ProductRepository productRepository,
                           AiMatchService aiMatchService,
                           ProductMapper mapper,
                           LiveEventPublisher events) {
        this.recommendationRepository = recommendationRepository;
        this.productRepository = productRepository;
        this.aiMatchService = aiMatchService;
        this.mapper = mapper;
        this.events = events;
    }

    @Transactional(readOnly = true)
    public CurationBoardDto board() {
        List<Product> active = productRepository.findByStatusNot(ProductStatus.ARCHIVED);
        List<ProductDto> dtos = mapper.toDtos(active);

        List<CurationBoardDto.TopCuration> tops = dtos.stream()
                .filter(p -> p.type().equals(ProductType.TOP.name()))
                .sorted(Comparator.comparing(ProductDto::name))
                .map(top -> new CurationBoardDto.TopCuration(top, aiMatchService.matchesFor(top.id())))
                .toList();
        List<ProductDto> candidates = dtos.stream()
                .filter(p -> !p.type().equals(ProductType.TOP.name()))
                .sorted(Comparator.comparing(ProductDto::type).thenComparing(ProductDto::name))
                .toList();
        return new CurationBoardDto(tops, candidates);
    }

    @Transactional
    public void approve(Long topId, Long matchId) {
        if (recommendationRepository.findByTopIdAndPantsId(topId, matchId).isPresent()) return;
        Product top = productRepository.findById(topId)
                .orElseThrow(() -> new IllegalArgumentException("No top with id " + topId));
        Product match = productRepository.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException("No product with id " + matchId));
        if (top.getType() != ProductType.TOP) {
            throw new IllegalArgumentException("\"" + top.getName() + "\" is not a top");
        }
        if (match.getType() == ProductType.TOP) {
            throw new IllegalArgumentException("A top can only be paired with bottoms, footwear, bags or accessories");
        }
        recommendationRepository.save(new Recommendation(top, match));
        events.publish(LiveEvent.CURATION_CHANGED, Map.of("topId", topId, "matchId", matchId, "approved", true));
    }

    @Transactional
    public void revoke(Long topId, Long matchId) {
        recommendationRepository.deleteByTopIdAndPantsId(topId, matchId);
        events.publish(LiveEvent.CURATION_CHANGED, Map.of("topId", topId, "matchId", matchId, "approved", false));
    }
}
