package com.willow.controller;

import com.willow.dto.request.CreateOrderRequest;
import com.willow.dto.response.OrderDto;
import com.willow.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Storefront checkout. New orders appear on each seller's dashboard immediately. */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /** Returns one order per store the bag drew from. */
    @PostMapping
    public ResponseEntity<List<OrderDto>> place(@Valid @RequestBody CreateOrderRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.place(req));
    }
}
