package com.cara.controller.seller;

import com.cara.dto.OrderDto;
import com.cara.dto.PageResponse;
import com.cara.dto.StatusRequest;
import com.cara.model.OrderStatus;
import com.cara.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/seller/orders")
public class SellerOrderController {

    private final OrderService orderService;

    public SellerOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // GET /api/seller/orders?q=&status=PENDING&page=0&size=10&sort=createdAt&dir=desc
    @GetMapping
    public PageResponse<OrderDto> search(@RequestParam(required = false) String q,
                                         @RequestParam(required = false) OrderStatus status,
                                         @RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "10") int size,
                                         @RequestParam(defaultValue = "createdAt") String sort,
                                         @RequestParam(defaultValue = "desc") String dir) {
        return orderService.search(q, status, Math.max(page, 0), Math.clamp(size, 1, 100),
                sort, Sort.Direction.fromOptionalString(dir).orElse(Sort.Direction.DESC));
    }

    @GetMapping("/counts")
    public Map<String, Long> counts() {
        return orderService.counts();
    }

    @GetMapping("/{id}")
    public OrderDto get(@PathVariable Long id) {
        return orderService.get(id);
    }

    @PatchMapping("/{id}/status")
    public OrderDto updateStatus(@PathVariable Long id, @Valid @RequestBody StatusRequest req) {
        return orderService.updateStatus(id, OrderStatus.valueOf(req.status().toUpperCase()));
    }
}
