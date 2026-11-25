package com.willow.controller;

import com.willow.security.SellerContext;
import com.willow.dto.request.*;
import com.willow.dto.response.*;
import com.willow.entity.ProductStatus;
import com.willow.entity.ProductType;
import com.willow.service.CatalogService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/seller/products")
public class SellerProductController {

    private final CatalogService catalogService;
    private final SellerContext seller;

    public SellerProductController(CatalogService catalogService, SellerContext seller) {
        this.catalogService = catalogService;
        this.seller = seller;
    }

    // GET /api/seller/products?q=&type=TOP&status=LIVE&stock=low&page=0&size=10&sort=price&dir=desc
    @GetMapping
    public PageResponse<ProductDto> search(@RequestParam(required = false) String q,
                                           @RequestParam(required = false) ProductType type,
                                           @RequestParam(required = false) ProductStatus status,
                                           @RequestParam(required = false) String stock,
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "10") int size,
                                           @RequestParam(defaultValue = "createdAt") String sort,
                                           @RequestParam(defaultValue = "desc") String dir) {
        return catalogService.search(seller.storeId(), q, type, status, stock, Math.max(page, 0), Math.clamp(size, 1, 100),
                sort, Sort.Direction.fromOptionalString(dir).orElse(Sort.Direction.DESC));
    }

    @GetMapping("/summary")
    public CatalogSummaryDto summary(@RequestParam(required = false) ProductType type) {
        return catalogService.summary(seller.storeId(), type);
    }

    @GetMapping("/{id}")
    public ProductDto get(@PathVariable Long id) {
        return catalogService.get(seller.storeId(), id);
    }

    @PostMapping
    public ResponseEntity<ProductDto> create(@Valid @RequestBody ProductRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(catalogService.create(seller.storeId(), req));
    }

    @PutMapping("/{id}")
    public ProductDto update(@PathVariable Long id, @Valid @RequestBody ProductRequest req) {
        return catalogService.update(seller.storeId(), id, req);
    }

    @PatchMapping("/{id}/status")
    public ProductDto changeStatus(@PathVariable Long id, @Valid @RequestBody StatusRequest req) {
        return catalogService.changeStatus(seller.storeId(), id, ProductStatus.valueOf(req.status().toUpperCase()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        catalogService.delete(seller.storeId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/bulk")
    public BulkResult bulk(@Valid @RequestBody BulkProductRequest req) {
        return catalogService.bulk(seller.storeId(), req);
    }
}
