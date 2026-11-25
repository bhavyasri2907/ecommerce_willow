package com.willow.controller;

import com.willow.dto.response.ProductDto;
import com.willow.entity.ProductType;
import com.willow.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** The storefront's catalogue: live products from every store. */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
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
}
