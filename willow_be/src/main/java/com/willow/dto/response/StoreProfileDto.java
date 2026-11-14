package com.willow.dto.response;

import com.willow.entity.StoreProfile;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record StoreProfileDto(
        @NotBlank(message = "Store name is required") @Size(max = 80) String storeName,
        @Size(max = 120) String tagline,
        @Size(max = 1000) String description,
        @Size(max = 80) String ownerName,
        @Email(message = "Email is invalid") String contactEmail,
        @Pattern(regexp = "^$|^[0-9+ ()-]{7,20}$", message = "Phone number is invalid") String contactPhone,
        @Size(max = 200) String addressLine,
        @Size(max = 80) String city,
        @Size(max = 80) String state,
        @Pattern(regexp = "^$|^[0-9]{6}$", message = "PIN code must be 6 digits") String pincode,
        @Pattern(regexp = "^$|^[0-9A-Z]{15}$", message = "GSTIN must be 15 characters (digits and capitals)") String gstin,
        @Pattern(regexp = "^$|^https?://.+", message = "Logo must be an http(s) URL") String logoUrl,
        @Pattern(regexp = "^$|^https?://.+", message = "Website must be an http(s) URL") String website,
        @Size(max = 60) String instagram,
        Instant updatedAt
) {
    public static StoreProfileDto from(StoreProfile s) {
        return new StoreProfileDto(s.getStoreName(), s.getTagline(), s.getDescription(), s.getOwnerName(),
                s.getContactEmail(), s.getContactPhone(), s.getAddressLine(), s.getCity(), s.getState(),
                s.getPincode(), s.getGstin(), s.getLogoUrl(), s.getWebsite(), s.getInstagram(), s.getUpdatedAt());
    }
}
