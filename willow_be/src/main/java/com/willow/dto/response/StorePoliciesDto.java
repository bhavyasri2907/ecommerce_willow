package com.willow.dto.response;

import com.willow.entity.SellerSettings;
import com.willow.entity.Store;

import java.math.BigDecimal;

/** The parts of one store's settings that shoppers are allowed to see: its shipping charges and return window. */
public record StorePoliciesDto(
        Long storeId,
        String storeName,
        BigDecimal shippingFee,
        BigDecimal freeShippingThreshold,
        int returnWindowDays
) {
    public static StorePoliciesDto from(Store store, SellerSettings s) {
        return new StorePoliciesDto(store.getId(), store.getStoreName(),
                s.getShippingFee(), s.getFreeShippingThreshold(), s.getReturnWindowDays());
    }
}
