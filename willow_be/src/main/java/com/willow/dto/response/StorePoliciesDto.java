package com.willow.dto.response;

import com.willow.entity.SellerSettings;

import java.math.BigDecimal;

/** The parts of the seller's settings that shoppers are allowed to see. */
public record StorePoliciesDto(
        BigDecimal shippingFee,
        BigDecimal freeShippingThreshold,
        int returnWindowDays
) {
    public static StorePoliciesDto from(SellerSettings s) {
        return new StorePoliciesDto(s.getShippingFee(), s.getFreeShippingThreshold(), s.getReturnWindowDays());
    }
}
