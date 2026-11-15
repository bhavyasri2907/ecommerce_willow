package com.willow.controller;

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

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    // GET /api/seller/analytics?range=30
    @GetMapping
    public AnalyticsDto report(@RequestParam(defaultValue = "30") int range) {
        return analyticsService.report(range);
    }
}
