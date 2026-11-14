package com.cara.dto;

import jakarta.validation.constraints.NotBlank;

/** Generic { "status": "..." } body used for product and order status changes. */
public record StatusRequest(@NotBlank(message = "Status is required") String status) {}
