package com.willow.dto.request;

import jakarta.validation.constraints.NotBlank;

/** Generic { "status": "..." } body used for product and order status changes. */
public record StatusRequest(@NotBlank(message = "Status is required") String status) {}
