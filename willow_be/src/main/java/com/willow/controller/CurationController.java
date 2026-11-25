package com.willow.controller;

import com.willow.dto.request.AddPickRequest;
import com.willow.dto.response.CurationBoardDto;
import com.willow.dto.response.ProductDto;
import com.willow.security.SellerContext;
import com.willow.service.CurationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Curated Fit on the seller dashboard: what the seller suggests wearing with each of their products. */
@RestController
@RequestMapping("/api/seller/curations")
public class CurationController {

    private final CurationService curationService;
    private final SellerContext seller;

    public CurationController(CurationService curationService, SellerContext seller) {
        this.curationService = curationService;
        this.seller = seller;
    }

    /** Every product of the store with its fit, for the Curated Picks page. */
    @GetMapping
    public CurationBoardDto board() {
        return curationService.board(seller.storeId());
    }

    /** GET /api/seller/curations/resolve?link=http://localhost:5173/product/1001 - the product a pasted link points to. */
    @GetMapping("/resolve")
    public ProductDto resolve(@RequestParam String link) {
        return curationService.resolveLink(link);
    }

    @GetMapping("/{productId}/picks")
    public List<ProductDto> picks(@PathVariable Long productId) {
        return curationService.picksOf(seller.storeId(), productId);
    }

    /** Adds a pick by pasted link or by product id; returns the product that was added. */
    @PostMapping("/{productId}/picks")
    public ResponseEntity<ProductDto> addPick(@PathVariable Long productId, @Valid @RequestBody AddPickRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(curationService.addPick(seller.storeId(), productId, req));
    }

    @DeleteMapping("/{productId}/picks/{pickId}")
    public ResponseEntity<Void> removePick(@PathVariable Long productId, @PathVariable Long pickId) {
        curationService.removePick(seller.storeId(), productId, pickId);
        return ResponseEntity.noContent().build();
    }
}
