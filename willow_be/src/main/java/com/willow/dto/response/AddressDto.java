package com.willow.dto.response;

import com.willow.entity.Address;

public record AddressDto(
        Long id,
        String fullName,
        String phone,
        String addressLine,
        String city,
        String state,
        String pincode,
        boolean isDefault
) {
    public static AddressDto from(Address a) {
        return new AddressDto(a.getId(), a.getFullName(), a.getPhone(), a.getAddressLine(),
                a.getCity(), a.getState(), a.getPincode(), a.isDefaultAddress());
    }
}
