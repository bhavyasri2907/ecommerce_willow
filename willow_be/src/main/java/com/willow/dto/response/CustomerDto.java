package com.willow.dto.response;

import com.willow.entity.Customer;

/** The signed-in shopper, as the storefront sees them. Never includes the password hash. */
public record CustomerDto(Long id, String fullName, String firstName, String email, String phone) {

    public static CustomerDto from(Customer c) {
        String firstName = c.getFullName().trim().split("\\s+")[0];
        return new CustomerDto(c.getId(), c.getFullName(), firstName, c.getEmail(), c.getPhone());
    }
}
