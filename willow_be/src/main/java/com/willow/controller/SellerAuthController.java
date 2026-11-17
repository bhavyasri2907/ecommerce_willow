package com.willow.controller;

import com.willow.dto.request.LoginRequest;
import com.willow.dto.request.SellerRegisterRequest;
import com.willow.dto.response.SellerAuthResponse;
import com.willow.dto.response.SellerDto;
import com.willow.security.SessionTokens;
import com.willow.service.SellerAuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Seller dashboard sign-up, sign-in and sign-out. These are the only /api/seller
 * endpoints that work without a session; see SellerAuthInterceptor.
 */
@RestController
@RequestMapping("/api/seller/auth")
public class SellerAuthController {

    private final SellerAuthService authService;

    public SellerAuthController(SellerAuthService authService) {
        this.authService = authService;
    }

    /** Lets the dashboard open on "set up your store" the first time and on sign-in afterwards. */
    @GetMapping("/status")
    public Map<String, Boolean> status() {
        return Map.of("registered", authService.storeHasOwner());
    }

    @PostMapping("/register")
    public ResponseEntity<SellerAuthResponse> register(@Valid @RequestBody SellerRegisterRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(req));
    }

    @PostMapping("/login")
    public SellerAuthResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @GetMapping("/me")
    public SellerDto me(@RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        return authService.currentSeller(SessionTokens.fromHeader(authorization));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        authService.logout(SessionTokens.fromHeader(authorization));
        return ResponseEntity.noContent().build();
    }
}
