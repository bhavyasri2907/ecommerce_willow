package com.cara.dto;

import com.cara.model.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;

/** Storefront checkout payload. */
public record CreateOrderRequest(
        @NotBlank(message = "Customer name is required") @Size(max = 120) String customerName,
        @NotBlank(message = "Email is required") @Email(message = "Email is invalid") String customerEmail,
        @Size(max = 20) String customerPhone,
        @Size(max = 300) String shippingAddress,
        @Size(max = 80) String shippingCity,
        @NotNull(message = "Payment method is required") PaymentMethod paymentMethod,
        @NotEmpty(message = "Order must contain at least one item") @Size(max = 50) List<@Valid Line> items
) {
    public record Line(
            @NotNull Long productId,
            @Size(max = 20) String size,
            @Min(value = 1, message = "Quantity must be at least 1") @Max(20) int quantity
    ) {}
}
