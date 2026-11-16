package com.willow.dto.request;

import jakarta.validation.constraints.NotBlank;

/** Body of POST /api/auth/login. */
public record LoginRequest(
        @NotBlank(message = "Enter your email") String email,
        @NotBlank(message = "Enter your password") String password
) {}
