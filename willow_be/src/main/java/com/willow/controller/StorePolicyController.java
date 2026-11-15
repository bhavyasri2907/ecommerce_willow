package com.willow.controller;

import com.willow.dto.response.StorePoliciesDto;
import com.willow.service.StoreService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Storefront-facing store information: shipping charges and the return window. */
@RestController
@RequestMapping("/api/store")
public class StorePolicyController {

    private final StoreService storeService;

    public StorePolicyController(StoreService storeService) {
        this.storeService = storeService;
    }

    @GetMapping("/policies")
    public StorePoliciesDto policies() {
        return storeService.getPolicies();
    }
}
