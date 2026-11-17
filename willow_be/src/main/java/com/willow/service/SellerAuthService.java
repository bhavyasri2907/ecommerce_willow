package com.willow.service;

import com.willow.dto.request.LoginRequest;
import com.willow.dto.request.SellerRegisterRequest;
import com.willow.dto.response.SellerAuthResponse;
import com.willow.dto.response.SellerDto;
import com.willow.entity.Seller;
import com.willow.entity.SellerSession;
import com.willow.exception.UnauthorizedException;
import com.willow.repository.SellerRepository;
import com.willow.repository.SellerSessionRepository;
import com.willow.security.SessionTokens;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;

/**
 * Seller dashboard accounts. Willow is a single store: the first sign-up creates the
 * owner and names the store, and after that sign-up is closed.
 */
@Service
public class SellerAuthService {

    private static final Duration SESSION_LIFETIME = Duration.ofDays(30);

    private final SellerRepository sellers;
    private final SellerSessionRepository sessions;
    private final StoreService storeService;
    private final PasswordEncoder passwordEncoder;
    /** Compared against when the email is unknown, so both kinds of failure take the same time. */
    private final String dummyHash;

    public SellerAuthService(SellerRepository sellers, SellerSessionRepository sessions,
                             StoreService storeService, PasswordEncoder passwordEncoder) {
        this.sellers = sellers;
        this.sessions = sessions;
        this.storeService = storeService;
        this.passwordEncoder = passwordEncoder;
        this.dummyHash = passwordEncoder.encode(SessionTokens.generate());
    }

    /** True once the store has its owner account; the dashboard then offers sign-in only. */
    @Transactional(readOnly = true)
    public boolean storeHasOwner() {
        return sellers.count() > 0;
    }

    @Transactional
    public SellerAuthResponse register(SellerRegisterRequest req) {
        if (storeHasOwner()) {
            throw new IllegalStateException("This store already has a seller account. Sign in instead.");
        }

        Seller seller = new Seller();
        seller.setFullName(req.fullName().trim());
        seller.setEmail(normaliseEmail(req.email()));
        seller.setPhone(req.phone() == null || req.phone().isBlank() ? null : req.phone().trim());
        seller.setPasswordHash(passwordEncoder.encode(req.password()));
        sellers.save(seller);

        storeService.setUpStore(req.storeName().trim(), seller.getFullName(), seller.getEmail(), seller.getPhone());
        return openSession(seller);
    }

    @Transactional
    public SellerAuthResponse login(LoginRequest req) {
        Seller seller = sellers.findByEmail(normaliseEmail(req.email())).orElse(null);
        String hash = seller == null ? dummyHash : seller.getPasswordHash();
        boolean passwordMatches = passwordEncoder.matches(req.password(), hash);
        if (seller == null || !passwordMatches) {
            throw new UnauthorizedException("Incorrect email or password");
        }
        sessions.deleteExpired(Instant.now());
        return openSession(seller);
    }

    /** The seller a token belongs to; 401 when the token is missing, unknown or expired. */
    @Transactional
    public SellerDto currentSeller(String token) {
        return SellerDto.from(requireSeller(token), storeService.getProfile().storeName());
    }

    /** Throws 401 unless the token belongs to a live seller session. Guards every /api/seller call. */
    @Transactional(readOnly = true)
    public Seller requireSeller(String token) {
        if (token == null) throw new UnauthorizedException("Please sign in to the seller panel");
        return sessions.findByTokenHash(SessionTokens.hash(token))
                .filter(s -> s.getExpiresAt().isAfter(Instant.now()))
                .map(SellerSession::getSeller)
                .orElseThrow(() -> new UnauthorizedException("Your session has expired. Please sign in again."));
    }

    /** Ends the session. Safe to call with a token that is already gone. */
    @Transactional
    public void logout(String token) {
        if (token != null) sessions.deleteByTokenHash(SessionTokens.hash(token));
    }

    private SellerAuthResponse openSession(Seller seller) {
        String token = SessionTokens.generate();
        sessions.save(new SellerSession(seller, SessionTokens.hash(token), Instant.now().plus(SESSION_LIFETIME)));
        return new SellerAuthResponse(token, SellerDto.from(seller, storeService.getProfile().storeName()));
    }

    private static String normaliseEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
