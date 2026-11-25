package com.willow.controller;

import com.willow.dto.response.StoreInfoDto;
import com.willow.dto.response.StorePoliciesDto;
import com.willow.service.StoreService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** What shoppers may know about the marketplace's stores: who they are and what they charge for shipping. */
@RestController
@RequestMapping("/api/stores")
public class StorefrontStoreController {

    private static final int MAX_STORES_PER_REQUEST = 50;

    private final StoreService storeService;

    public StorefrontStoreController(StoreService storeService) {
        this.storeService = storeService;
    }

    /** A store's name, tagline, description and logo. */
    @GetMapping("/{id}")
    public StoreInfoDto info(@PathVariable Long id) {
        return storeService.getPublicInfo(id);
    }

    /** GET /api/stores/policies?ids=1,4 - shipping charges and return windows of the stores in a shopper's bag. */
    @GetMapping("/policies")
    public List<StorePoliciesDto> policies(@RequestParam List<Long> ids) {
        return storeService.getPolicies(ids.stream().distinct().limit(MAX_STORES_PER_REQUEST).toList());
    }
}
