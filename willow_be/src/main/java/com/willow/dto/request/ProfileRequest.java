package com.willow.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Body of PUT /api/account/profile. {@code currentPassword} is only needed when the email changes,
 * since the email is what the shopper signs in with.
 */
public record ProfileRequest(
        @NotBlank(message = "Enter your name")
        @Size(max = 120, message = "Name is too long")
        String fullName,

        @NotBlank(message = "Enter your email")
        @Email(message = "Enter a valid email address")
        @Size(max = 255, message = "Email is too long")
        String email,

        @Pattern(regexp = "^$|^(\\+91[\\- ]?)?[6-9]\\d{9}$", message = "Enter a valid 10-digit mobile number")
        String phone,

        String currentPassword
) {}
