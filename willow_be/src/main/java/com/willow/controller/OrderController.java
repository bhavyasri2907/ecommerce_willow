package com.willow.controller;

import com.willow.dto.request.CancelOrderRequest;
import com.willow.dto.request.CheckoutRequest;
import com.willow.dto.response.OrderDto;
import com.willow.dto.response.PageResponse;
import com.willow.security.CustomerContext;
import com.willow.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Storefront orders for the signed-in shopper: checkout, My Orders and cancellation.
 * New orders appear on each seller's dashboard immediately.
 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final CustomerContext customer;

    public OrderController(OrderService orderService, CustomerContext customer) {
        this.orderService = orderService;
        this.customer = customer;
    }

    /** Places the bag (Cash on Delivery). Returns one order per store the bag drew from. */
    @PostMapping
    public ResponseEntity<List<OrderDto>> checkout(@Valid @RequestBody CheckoutRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.checkout(customer.customerId(), req));
    }

    // GET /api/orders?page=0&size=10
    @GetMapping
    public PageResponse<OrderDto> list(@RequestParam(defaultValue = "0") int page,
                                       @RequestParam(defaultValue = "10") int size) {
        return orderService.customerOrders(customer.customerId(), Math.max(page, 0), Math.clamp(size, 1, 50));
    }

    @GetMapping("/{orderNumber}")
    public OrderDto get(@PathVariable String orderNumber) {
        return orderService.customerOrder(customer.customerId(), orderNumber);
    }

    @PostMapping("/{orderNumber}/cancel")
    public OrderDto cancel(@PathVariable String orderNumber, @Valid @RequestBody(required = false) CancelOrderRequest req) {
        return orderService.cancelByCustomer(customer.customerId(), orderNumber, req == null ? null : req.reason());
    }
}
