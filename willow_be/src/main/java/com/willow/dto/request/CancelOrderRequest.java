package com.willow.dto.request;

import jakarta.validation.constraints.Size;

/** Why a shopper is cancelling their order. Optional. */
public record CancelOrderRequest(@Size(max = 300, message = "Keep the reason under 300 characters") String reason) {}
