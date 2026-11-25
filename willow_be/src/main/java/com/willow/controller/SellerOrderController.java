package com.willow.controller;

import com.willow.security.SellerContext;
import com.willow.dto.response.OrderDto;
import com.willow.dto.response.PageResponse;
import com.willow.dto.request.StatusRequest;
import com.willow.entity.OrderStatus;
import com.willow.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/seller/orders")
public class SellerOrderController {

    private final OrderService orderService;
    private final SellerContext seller;

    public SellerOrderController(OrderService orderService, SellerContext seller) {
        this.orderService = orderService;
        this.seller = seller;
    }

    // GET /api/seller/orders?q=&status=PENDING&page=0&size=10&sort=createdAt&dir=desc
    @GetMapping
    public PageResponse<OrderDto> search(@RequestParam(required = false) String q,
                                         @RequestParam(required = false) OrderStatus status,
                                         @RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "10") int size,
                                         @RequestParam(defaultValue = "createdAt") String sort,
                                         @RequestParam(defaultValue = "desc") String dir) {
        return orderService.search(seller.storeId(), q, status, Math.max(page, 0), Math.clamp(size, 1, 100),
                sort, Sort.Direction.fromOptionalString(dir).orElse(Sort.Direction.DESC));
    }

    @GetMapping("/counts")
    public Map<String, Long> counts() {
        return orderService.counts(seller.storeId());
    }

    @GetMapping("/{id}")
    public OrderDto get(@PathVariable Long id) {
        return orderService.get(seller.storeId(), id);
    }

    @PatchMapping("/{id}/status")
    public OrderDto updateStatus(@PathVariable Long id, @Valid @RequestBody StatusRequest req) {
        return orderService.updateStatus(seller.storeId(), id, OrderStatus.valueOf(req.status().toUpperCase()));
    }
}
