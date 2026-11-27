package com.willow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Body of PUT /api/account/password. */
public record ChangePasswordRequest(
        @NotBlank(message = "Enter your current password")
        String currentPassword,

        @NotBlank(message = "Choose a new password")
        @Size(min = 8, max = 72, message = "Password must be 8 to 72 characters")
        String newPassword
) {}
