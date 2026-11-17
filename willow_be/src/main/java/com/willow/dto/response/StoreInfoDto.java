package com.willow.dto.response;

import com.willow.entity.StoreProfile;

/** The store's public identity, shown to shoppers ("Sold by ..."). */
public record StoreInfoDto(String storeName, String tagline, String logoUrl) {

    public static StoreInfoDto from(StoreProfile s) {
        return new StoreInfoDto(s.getStoreName(), s.getTagline(), s.getLogoUrl());
    }
}
