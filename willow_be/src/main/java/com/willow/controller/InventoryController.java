package com.willow.controller;

import com.willow.dto.response.InventoryItemDto;
import com.willow.dto.response.InventorySummaryDto;
import com.willow.dto.request.StockAdjustmentRequest;
import com.willow.dto.response.StockMovementDto;
import com.willow.entity.ProductType;
import com.willow.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seller/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    // GET /api/seller/inventory?q=&type=SHOES&filter=low
    @GetMapping
    public List<InventoryItemDto> list(@RequestParam(required = false) String q,
                                       @RequestParam(required = false) ProductType type,
                                       @RequestParam(required = false) String filter) {
        return inventoryService.list(q, type, filter);
    }

    @GetMapping("/summary")
    public InventorySummaryDto summary() {
        return inventoryService.summary();
    }

    @PostMapping("/{productId}/adjust")
    public InventoryItemDto adjust(@PathVariable Long productId, @Valid @RequestBody StockAdjustmentRequest req) {
        return inventoryService.adjust(productId, req);
    }

    // GET /api/seller/inventory/movements?productId=101&limit=20
    @GetMapping("/movements")
    public List<StockMovementDto> movements(@RequestParam(required = false) Long productId,
                                            @RequestParam(defaultValue = "20") int limit) {
        return inventoryService.movements(productId, limit);
    }
}
