package com.willow.dto.response;

/** Returned after registering or signing in: the session token and who it belongs to. */
public record AuthResponse(String token, CustomerDto customer) {}
