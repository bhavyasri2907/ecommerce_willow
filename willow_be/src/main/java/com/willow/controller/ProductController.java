package com.willow.controller;

import com.willow.dto.response.ProductDto;
import com.willow.dto.response.ProductReviewsDto;
import com.willow.entity.ProductType;
import com.willow.service.CurationService;
import com.willow.service.ProductService;
import com.willow.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** The storefront's catalogue: live products from every store. */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    private final CurationService curationService;
    private final ReviewService reviewService;

    public ProductController(ProductService productService, CurationService curationService, ReviewService reviewService) {
        this.productService = productService;
        this.curationService = curationService;
        this.reviewService = reviewService;
    }

    // GET /api/products?type=TOP&storeId=4 - both filters are optional
    @GetMapping
    public List<ProductDto> list(@RequestParam(required = false) ProductType type,
                                 @RequestParam(required = false) Long storeId) {
        return productService.findAll(type, storeId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(productService.findById(id));
    }

    /** Rating summary and a page of reviews. {@code sort} is NEWEST (default), HIGHEST or LOWEST. */
    @GetMapping("/{id}/reviews")
    public ProductReviewsDto reviews(@PathVariable Long id,
                                     @RequestParam(defaultValue = "NEWEST") ReviewService.SortBy sort,
                                     @RequestParam(defaultValue = "0") int page,
                                     @RequestParam(defaultValue = "5") int size) {
        return reviewService.forProduct(id, sort, page, size);
    }

    /** The seller's Curated Fit for a product: what they suggest wearing with it. Empty when they have not made one. */
    @GetMapping("/{id}/curated-fit")
    public List<ProductDto> curatedFit(@PathVariable Long id) {
        productService.findById(id); // 404 unless the product itself is on sale
        return curationService.curatedFit(id);
    }
}
