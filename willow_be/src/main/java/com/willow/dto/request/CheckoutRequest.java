package com.willow.dto.request;

import com.willow.entity.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;

/**
 * Storefront checkout by a signed-in shopper.
 *
 * @param checkoutRef   id the browser generates once per checkout; resending the same checkout returns the
 *                      orders it already created instead of placing them again
 * @param addressId     one of the shopper's saved addresses
 * @param paymentMethod only {@code COD} is accepted for now; defaults to it when left out
 */
public record CheckoutRequest(
        @NotBlank(message = "Checkout reference is required")
        @Size(max = 64)
        @Pattern(regexp = "[A-Za-z0-9-]+", message = "Checkout reference is invalid")
        String checkoutRef,
        @NotNull(message = "Choose a delivery address") Long addressId,
        PaymentMethod paymentMethod,
        @NotEmpty(message = "Your bag is empty") @Size(max = 50, message = "At most 50 items per checkout")
        List<@Valid OrderLine> items
) {}
