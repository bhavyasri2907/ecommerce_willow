package com.willow.service;

import com.willow.dto.response.ProductDto;
import com.willow.dto.response.RatingStats;
import com.willow.entity.Product;
import com.willow.entity.ProductStatus;
import com.willow.entity.ProductType;
import com.willow.exception.NotFoundException;
import com.willow.repository.ProductRepository;
import com.willow.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** Storefront (public) product reads across every store. Only LIVE products are shown to shoppers. */
@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;

    public ProductService(ProductRepository productRepository, ReviewRepository reviewRepository) {
        this.productRepository = productRepository;
        this.reviewRepository = reviewRepository;
    }

    /**
     * @param type    limit to one category; null for all
     * @param storeId limit to one seller's store; null for the whole marketplace
     */
    @Transactional(readOnly = true)
    public List<ProductDto> findAll(ProductType type, Long storeId) {
        List<Product> products = ((type == null)
                ? productRepository.findByStatus(ProductStatus.LIVE)
                : productRepository.findByTypeAndStatus(type, ProductStatus.LIVE))
                .stream()
                .filter(p -> storeId == null || p.getStore().getId().equals(storeId))
                .toList();
        Map<Long, RatingStats> ratings = ratings(products.stream().map(Product::getId).toList());
        return products.stream()
                .map(p -> ProductDto.from(p, ratings.getOrDefault(p.getId(), RatingStats.NONE)))
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductDto findById(Long id) {
        Product p = findLive(id);
        return ProductDto.from(p, ratings(List.of(id)).getOrDefault(id, RatingStats.NONE));
    }

    /** A product that is on sale. Drafts and archived products are not, so shoppers cannot open them either. */
    @Transactional(readOnly = true)
    public Product findLive(Long id) {
        return productRepository.findById(id)
                .filter(product -> product.getStatus() == ProductStatus.LIVE)
                .orElseThrow(() -> new NotFoundException("product", id));
    }

    /** Average rating and review count per product; products without reviews are left out. */
    @Transactional(readOnly = true)
    public Map<Long, RatingStats> ratings(Collection<Long> productIds) {
        Map<Long, RatingStats> map = new HashMap<>();
        if (productIds.isEmpty()) return map;
        for (Object[] row : reviewRepository.statsFor(productIds)) {
            map.put((Long) row[0], RatingStats.of(((Number) row[1]).doubleValue(), ((Number) row[2]).longValue()));
        }
        return map;
    }
}
