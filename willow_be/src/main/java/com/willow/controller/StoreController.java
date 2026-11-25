package com.willow.controller;

import com.willow.security.SellerContext;
import com.willow.dto.response.SellerSettingsDto;
import com.willow.dto.response.StoreProfileDto;
import com.willow.service.StoreService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/seller")
public class StoreController {

    private final StoreService storeService;
    private final SellerContext seller;

    public StoreController(StoreService storeService, SellerContext seller) {
        this.storeService = storeService;
        this.seller = seller;
    }

    @GetMapping("/store")
    public StoreProfileDto profile() {
        return storeService.getProfile(seller.storeId());
    }

    @PutMapping("/store")
    public StoreProfileDto updateProfile(@Valid @RequestBody StoreProfileDto req) {
        return storeService.updateProfile(seller.storeId(), req);
    }

    @GetMapping("/settings")
    public SellerSettingsDto settings() {
        return storeService.getSettings(seller.storeId());
    }

    @PutMapping("/settings")
    public SellerSettingsDto updateSettings(@Valid @RequestBody SellerSettingsDto req) {
        return storeService.updateSettings(seller.storeId(), req);
    }
}
