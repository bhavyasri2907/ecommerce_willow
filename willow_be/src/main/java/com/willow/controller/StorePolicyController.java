package com.willow.controller;

import com.willow.dto.response.StoreInfoDto;
import com.willow.dto.response.StorePoliciesDto;
import com.willow.service.StoreService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Storefront-facing store information: its public identity, shipping charges and the return window. */
@RestController
@RequestMapping("/api/store")
public class StorePolicyController {

    private final StoreService storeService;

    public StorePolicyController(StoreService storeService) {
        this.storeService = storeService;
    }

    /** Who the shopper is buying from. */
    @GetMapping
    public StoreInfoDto info() {
        return storeService.getPublicInfo();
    }

    @GetMapping("/policies")
    public StorePoliciesDto policies() {
        return storeService.getPolicies();
    }
}
