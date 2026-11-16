package com.willow.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Body of POST /api/auth/register. */
public record RegisterRequest(
        @NotBlank(message = "Enter your name")
        @Size(max = 120, message = "Name is too long")
        String fullName,

        @NotBlank(message = "Enter your email")
        @Email(message = "Enter a valid email address")
        @Size(max = 255, message = "Email is too long")
        String email,

        @Pattern(regexp = "^$|^\\+?[0-9 ]{7,19}$", message = "Enter a valid phone number")
        String phone,

        @NotBlank(message = "Choose a password")
        @Size(min = 8, max = 72, message = "Password must be 8 to 72 characters")
        String password
) {}
