package com.willow.dto.response;

import com.willow.entity.Store;

/** A store's public identity, shown to shoppers ("Sold by ..."). */
public record StoreInfoDto(Long id, String storeName, String tagline, String description, String logoUrl) {

    public static StoreInfoDto from(Store s) {
        return new StoreInfoDto(s.getId(), s.getStoreName(), s.getTagline(), s.getDescription(), s.getLogoUrl());
    }
}
