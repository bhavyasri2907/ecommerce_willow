package com.willow.controller;

import com.willow.security.SellerContext;
import com.willow.dto.response.AnalyticsDto;
import com.willow.service.AnalyticsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/seller/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final SellerContext seller;

    public AnalyticsController(AnalyticsService analyticsService, SellerContext seller) {
        this.analyticsService = analyticsService;
        this.seller = seller;
    }

    // GET /api/seller/analytics?range=30
    @GetMapping
    public AnalyticsDto report(@RequestParam(defaultValue = "30") int range) {
        return analyticsService.report(seller.storeId(), range);
    }
}
