package com.willow.dto.response;

/** Returned after a seller registers or signs in: the session token and who it belongs to. */
public record SellerAuthResponse(String token, SellerDto seller) {}
