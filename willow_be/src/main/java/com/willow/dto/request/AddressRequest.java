package com.willow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** A delivery address to save in the shopper's address book (Indian addresses). */
public record AddressRequest(
        @NotBlank(message = "Enter the recipient's name") @Size(max = 120) String fullName,
        @NotBlank(message = "Enter a mobile number")
        @Pattern(regexp = "^(\\+91[\\- ]?)?[6-9]\\d{9}$", message = "Enter a valid 10-digit mobile number")
        String phone,
        @NotBlank(message = "Enter the house number, street and area") @Size(max = 300) String addressLine,
        @NotBlank(message = "Enter the city") @Size(max = 80) String city,
        @NotBlank(message = "Enter the state") @Size(max = 80) String state,
        @NotBlank(message = "Enter the pincode")
        @Pattern(regexp = "^[1-9]\\d{5}$", message = "Enter a valid 6-digit pincode")
        String pincode,
        /** Make this the address checkout picks first. The first saved address is always the default. */
        Boolean makeDefault
) {}
