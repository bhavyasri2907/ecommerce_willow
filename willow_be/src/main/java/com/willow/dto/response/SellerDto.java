package com.willow.dto.response;

import com.willow.entity.Seller;

/** The signed-in seller, as the dashboard sees them. Never includes the password hash. */
public record SellerDto(Long id, String fullName, String email, String phone, String storeName) {

    public static SellerDto from(Seller s, String storeName) {
        return new SellerDto(s.getId(), s.getFullName(), s.getEmail(), s.getPhone(), storeName);
    }
}
