package com.willow.controller;

import com.willow.dto.request.ChangePasswordRequest;
import com.willow.dto.request.ProfileRequest;
import com.willow.dto.response.CustomerDto;
import com.willow.security.CustomerContext;
import com.willow.security.SessionTokens;
import com.willow.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** The signed-in shopper's own details (My Account > Profile). */
@RestController
@RequestMapping("/api/account")
public class ProfileController {

    private final AuthService authService;
    private final CustomerContext customer;

    public ProfileController(AuthService authService, CustomerContext customer) {
        this.authService = authService;
        this.customer = customer;
    }

    @PutMapping("/profile")
    public CustomerDto updateProfile(@Valid @RequestBody ProfileRequest req) {
        return authService.updateProfile(customer.customerId(), req);
    }

    /** Changes the password; other signed-in devices are signed out, this one stays signed in. */
    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
                                               @Valid @RequestBody ChangePasswordRequest req) {
        authService.changePassword(customer.customerId(), SessionTokens.fromHeader(authorization), req);
        return ResponseEntity.noContent().build();
    }
}
