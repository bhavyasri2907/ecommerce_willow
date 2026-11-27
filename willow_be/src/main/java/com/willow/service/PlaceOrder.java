package com.willow.service;

import com.willow.dto.request.OrderLine;
import com.willow.entity.Customer;
import com.willow.entity.PaymentMethod;

import java.util.List;

/**
 * Everything OrderService needs to place a bag: who is buying, where it ships and what is in it.
 * Built from a storefront checkout (customer + saved address) or by the live order simulator
 * (no customer, no checkout reference).
 */
public record PlaceOrder(
        Customer customer,
        String checkoutRef,
        String name,
        String email,
        String phone,
        String addressLine,
        String city,
        String state,
        String pincode,
        PaymentMethod paymentMethod,
        List<OrderLine> items
) {}
