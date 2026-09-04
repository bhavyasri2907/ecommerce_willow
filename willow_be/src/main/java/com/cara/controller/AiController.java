package com.cara.controller;

import com.cara.dto.MatchDto;
import com.cara.service.AiMatchService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiMatchService aiMatchService;

    public AiController(AiMatchService aiMatchService) {
        this.aiMatchService = aiMatchService;
    }

    // GET /api/ai/recommendations/101 -> ranked, explained pants for top 101
    @GetMapping("/recommendations/{topId}")
    public List<MatchDto> recommendationsFor(@PathVariable Long topId) {
        return aiMatchService.matchesFor(topId);
    }
}
