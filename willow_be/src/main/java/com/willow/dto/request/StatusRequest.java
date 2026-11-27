package com.willow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Generic { "status": "...", "note": "..." } body used for product and order status changes. The note is optional. */
public record StatusRequest(
        @NotBlank(message = "Status is required") String status,
        @Size(max = 300, message = "Keep the note under 300 characters") String note
) {}
