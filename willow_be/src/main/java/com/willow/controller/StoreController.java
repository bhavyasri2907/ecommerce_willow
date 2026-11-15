package com.willow.controller;

import com.willow.dto.response.SellerSettingsDto;
import com.willow.dto.response.StoreProfileDto;
import com.willow.service.StoreService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/seller")
public class StoreController {

    private final StoreService storeService;

    public StoreController(StoreService storeService) {
        this.storeService = storeService;
    }

    @GetMapping("/store")
    public StoreProfileDto profile() {
        return storeService.getProfile();
    }

    @PutMapping("/store")
    public StoreProfileDto updateProfile(@Valid @RequestBody StoreProfileDto req) {
        return storeService.updateProfile(req);
    }

    @GetMapping("/settings")
    public SellerSettingsDto settings() {
        return storeService.getSettings();
    }

    @PutMapping("/settings")
    public SellerSettingsDto updateSettings(@Valid @RequestBody SellerSettingsDto req) {
        return storeService.updateSettings(req);
    }
}
