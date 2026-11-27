package com.willow.controller;

import com.willow.dto.request.ReviewRequest;
import com.willow.dto.response.MyReviewDto;
import com.willow.dto.response.ReviewStatusDto;
import com.willow.security.CustomerContext;
import com.willow.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** The signed-in shopper's own reviews (My Account > My Reviews, and the review form on product pages). */
@RestController
@RequestMapping("/api/account/reviews")
public class ReviewController {

    private final ReviewService reviewService;
    private final CustomerContext customer;

    public ReviewController(ReviewService reviewService, CustomerContext customer) {
        this.reviewService = reviewService;
        this.customer = customer;
    }

    @GetMapping
    public List<MyReviewDto> mine() {
        return reviewService.mine(customer.customerId());
    }

    /** Delivered products the shopper has not reviewed yet. */
    @GetMapping("/pending")
    public List<MyReviewDto.ReviewableProductDto> pending() {
        return reviewService.awaitingReview(customer.customerId());
    }

    @GetMapping("/product/{productId}")
    public ReviewStatusDto status(@PathVariable Long productId) {
        return reviewService.status(customer.customerId(), productId);
    }

    /** Writes the review, or replaces the shopper's earlier one. */
    @PutMapping("/product/{productId}")
    public MyReviewDto save(@PathVariable Long productId, @Valid @RequestBody ReviewRequest req) {
        return reviewService.save(customer.customerId(), productId, req);
    }

    @DeleteMapping("/product/{productId}")
    public ResponseEntity<Void> delete(@PathVariable Long productId) {
        reviewService.delete(customer.customerId(), productId);
        return ResponseEntity.noContent().build();
    }
}
