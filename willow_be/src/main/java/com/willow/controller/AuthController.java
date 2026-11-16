package com.willow.controller;

import com.willow.dto.request.LoginRequest;
import com.willow.dto.request.RegisterRequest;
import com.willow.dto.response.AuthResponse;
import com.willow.dto.response.CustomerDto;
import com.willow.security.SessionTokens;
import com.willow.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** Storefront sign-up, sign-in and sign-out. The token travels as {@code Authorization: Bearer <token>}. */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(req));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @GetMapping("/me")
    public CustomerDto me(@RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        return authService.currentCustomer(SessionTokens.fromHeader(authorization));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        authService.logout(SessionTokens.fromHeader(authorization));
        return ResponseEntity.noContent().build();
    }
}
