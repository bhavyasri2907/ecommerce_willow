package com.willow.service;

import com.willow.dto.request.ReviewRequest;
import com.willow.dto.response.*;
import com.willow.entity.OrderStatus;
import com.willow.entity.Product;
import com.willow.entity.Review;
import com.willow.exception.NotFoundException;
import com.willow.repository.CustomerRepository;
import com.willow.repository.OrderItemRepository;
import com.willow.repository.ProductRepository;
import com.willow.repository.ReviewRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Product reviews. A shopper may review a product once they have a delivered order containing it;
 * they get one review per product, which they can edit or delete at any time.
 */
@Service
public class ReviewService {

    private static final int MAX_PAGE_SIZE = 20;

    /** Product page sort options. */
    public enum SortBy {
        NEWEST(Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"))),
        HIGHEST(Sort.by(Sort.Order.desc("rating"), Sort.Order.desc("createdAt"), Sort.Order.desc("id"))),
        LOWEST(Sort.by(Sort.Order.asc("rating"), Sort.Order.desc("createdAt"), Sort.Order.desc("id")));

        final Sort sort;

        SortBy(Sort sort) {
            this.sort = sort;
        }
    }

    private final ReviewRepository reviews;
    private final OrderItemRepository orderItems;
    private final ProductRepository products;
    private final CustomerRepository customers;
    private final ProductService productService;

    public ReviewService(ReviewRepository reviews, OrderItemRepository orderItems, ProductRepository products,
                         CustomerRepository customers, ProductService productService) {
        this.reviews = reviews;
        this.orderItems = orderItems;
        this.products = products;
        this.customers = customers;
        this.productService = productService;
    }

    /** Rating summary and one page of a live product's reviews. */
    @Transactional(readOnly = true)
    public ProductReviewsDto forProduct(Long productId, SortBy sortBy, int page, int size) {
        productService.findLive(productId); // 404 unless the product is on sale

        Map<Integer, Long> byStars = new HashMap<>();
        for (Object[] row : reviews.ratingBreakdown(productId)) {
            byStars.put(((Number) row[0]).intValue(), ((Number) row[1]).longValue());
        }
        long count = byStars.values().stream().mapToLong(Long::longValue).sum();
        long starSum = byStars.entrySet().stream().mapToLong(e -> e.getKey() * e.getValue()).sum();
        RatingStats stats = count == 0 ? RatingStats.NONE : RatingStats.of((double) starSum / count, count);

        List<ProductReviewsDto.StarCount> breakdown = new ArrayList<>();
        for (int stars = 5; stars >= 1; stars--) {
            breakdown.add(new ProductReviewsDto.StarCount(stars, byStars.getOrDefault(stars, 0L)));
        }

        PageRequest pageable = PageRequest.of(Math.max(page, 0), Math.clamp(size, 1, MAX_PAGE_SIZE), sortBy.sort);
        PageResponse<ReviewDto> pageOfReviews = PageResponse.of(reviews.findForProduct(productId, pageable), ReviewDto::from);
        return new ProductReviewsDto(stats.average(), stats.count(), breakdown, pageOfReviews);
    }

    /** Whether the shopper can review the product, and their existing review. */
    @Transactional(readOnly = true)
    public ReviewStatusDto status(Long customerId, Long productId) {
        Optional<Review> mine = reviews.findByProductIdAndCustomerId(productId, customerId);
        boolean canReview = mine.isPresent() || hasDelivered(customerId, productId);
        return new ReviewStatusDto(canReview, mine.map(MyReviewDto::from).orElse(null));
    }

    /** Everything the shopper has reviewed, most recent first. */
    @Transactional(readOnly = true)
    public List<MyReviewDto> mine(Long customerId) {
        return reviews.findForCustomer(customerId).stream().map(MyReviewDto::from).toList();
    }

    /** Products from the shopper's delivered orders that they have not reviewed yet, most recently delivered first. */
    @Transactional(readOnly = true)
    public List<MyReviewDto.ReviewableProductDto> awaitingReview(Long customerId) {
        List<Long> ids = orderItems.unreviewedProducts(customerId, OrderStatus.DELIVERED).stream()
                .map(row -> (Long) row[0])
                .toList();
        Map<Long, Product> byId = new HashMap<>();
        products.findAllById(ids).forEach(p -> byId.put(p.getId(), p));
        return ids.stream()
                .map(byId::get)
                .filter(Objects::nonNull)
                .map(MyReviewDto.ReviewableProductDto::from)
                .toList();
    }

    /** Writes the shopper's review of a product, or replaces the one they wrote before. */
    @Transactional
    public MyReviewDto save(Long customerId, Long productId, ReviewRequest req) {
        Review review = reviews.findByProductIdAndCustomerId(productId, customerId).orElseGet(() -> {
            Product product = products.findById(productId).orElseThrow(() -> new NotFoundException("product", productId));
            if (!hasDelivered(customerId, productId)) {
                throw new IllegalStateException("You can review this piece once an order containing it has been delivered.");
            }
            return new Review(product, customers.getReferenceById(customerId));
        });
        review.setRating(req.rating());
        review.setTitle(blankToNull(req.title()));
        review.setComment(blankToNull(req.comment()));
        return MyReviewDto.from(reviews.saveAndFlush(review));
    }

    @Transactional
    public void delete(Long customerId, Long productId) {
        Review review = reviews.findByProductIdAndCustomerId(productId, customerId)
                .orElseThrow(() -> new NotFoundException("review for product", productId));
        reviews.delete(review);
    }

    private boolean hasDelivered(Long customerId, Long productId) {
        return orderItems.customerHasProductInStatus(customerId, productId, OrderStatus.DELIVERED);
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
