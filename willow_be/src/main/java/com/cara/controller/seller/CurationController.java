package com.cara.controller.seller;

import com.cara.dto.CurationBoardDto;
import com.cara.service.CurationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Read model for the Curated Picks screen. Approving and revoking pairings goes
 * through the existing POST/DELETE /api/recommendations endpoints.
 */
@RestController
@RequestMapping("/api/seller/curations")
public class CurationController {

    private final CurationService curationService;

    public CurationController(CurationService curationService) {
        this.curationService = curationService;
    }

    @GetMapping
    public CurationBoardDto board() {
        return curationService.board();
    }
}
