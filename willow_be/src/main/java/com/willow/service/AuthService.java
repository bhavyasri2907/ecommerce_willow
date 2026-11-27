package com.willow.service;

import com.willow.dto.request.ChangePasswordRequest;
import com.willow.dto.request.LoginRequest;
import com.willow.dto.request.ProfileRequest;
import com.willow.dto.request.RegisterRequest;
import com.willow.dto.response.AuthResponse;
import com.willow.dto.response.CustomerDto;
import com.willow.entity.Customer;
import com.willow.entity.CustomerSession;
import com.willow.exception.UnauthorizedException;
import com.willow.repository.CustomerRepository;
import com.willow.repository.CustomerSessionRepository;
import com.willow.security.SessionTokens;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;

/** Storefront accounts: sign up, sign in, the current shopper, sign out. */
@Service
public class AuthService {

    private static final Duration SESSION_LIFETIME = Duration.ofDays(30);

    private final CustomerRepository customers;
    private final CustomerSessionRepository sessions;
    private final PasswordEncoder passwordEncoder;
    /** Compared against when the email is unknown, so both kinds of failure take the same time. */
    private final String dummyHash;

    public AuthService(CustomerRepository customers, CustomerSessionRepository sessions, PasswordEncoder passwordEncoder) {
        this.customers = customers;
        this.sessions = sessions;
        this.passwordEncoder = passwordEncoder;
        this.dummyHash = passwordEncoder.encode(SessionTokens.generate());
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = normaliseEmail(req.email());
        if (customers.existsByEmail(email)) {
            throw new IllegalStateException("An account with this email already exists. Try signing in.");
        }

        Customer customer = new Customer();
        customer.setFullName(req.fullName().trim());
        customer.setEmail(email);
        customer.setPhone(req.phone() == null || req.phone().isBlank() ? null : req.phone().trim());
        customer.setPasswordHash(passwordEncoder.encode(req.password()));
        customers.save(customer);

        return openSession(customer);
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        Customer customer = customers.findByEmail(normaliseEmail(req.email())).orElse(null);
        String hash = customer == null ? dummyHash : customer.getPasswordHash();
        boolean passwordMatches = passwordEncoder.matches(req.password(), hash);
        if (customer == null || !passwordMatches) {
            throw new UnauthorizedException("Incorrect email or password");
        }
        sessions.deleteExpired(Instant.now());
        return openSession(customer);
    }

    /** The shopper a token belongs to; 401 when the token is missing, unknown or expired. */
    @Transactional(readOnly = true)
    public CustomerDto currentCustomer(String token) {
        return CustomerDto.from(requireSession(token).getCustomer());
    }

    /** The id of the shopper a token belongs to; 401 when the token is missing, unknown or expired. */
    @Transactional(readOnly = true)
    public Long requireCustomerId(String token) {
        return requireSession(token).getCustomer().getId();
    }

    private CustomerSession requireSession(String token) {
        if (token == null) throw new UnauthorizedException("Please sign in");
        return sessions.findByTokenHash(SessionTokens.hash(token))
                .filter(s -> s.getExpiresAt().isAfter(Instant.now()))
                .orElseThrow(() -> new UnauthorizedException("Your session has expired. Please sign in again."));
    }

    /** Updates the shopper's name, email and phone. Changing the email needs the current password. */
    @Transactional
    public CustomerDto updateProfile(Long customerId, ProfileRequest req) {
        Customer customer = customers.findById(customerId).orElseThrow(() -> new UnauthorizedException("Please sign in"));
        String email = normaliseEmail(req.email());
        if (!email.equals(customer.getEmail())) {
            if (req.currentPassword() == null || !passwordEncoder.matches(req.currentPassword(), customer.getPasswordHash())) {
                throw new IllegalArgumentException("Enter your current password to change your email.");
            }
            if (customers.existsByEmail(email)) {
                throw new IllegalStateException("Another account already uses this email.");
            }
            customer.setEmail(email);
        }
        customer.setFullName(req.fullName().trim());
        customer.setPhone(req.phone() == null || req.phone().isBlank() ? null : AddressService.normalisePhone(req.phone()));
        return CustomerDto.from(customers.saveAndFlush(customer));
    }

    /** Changes the password and signs the shopper out on every other device; this session stays open. */
    @Transactional
    public void changePassword(Long customerId, String currentToken, ChangePasswordRequest req) {
        Customer customer = customers.findById(customerId).orElseThrow(() -> new UnauthorizedException("Please sign in"));
        if (!passwordEncoder.matches(req.currentPassword(), customer.getPasswordHash())) {
            throw new IllegalArgumentException("Your current password is incorrect.");
        }
        if (passwordEncoder.matches(req.newPassword(), customer.getPasswordHash())) {
            throw new IllegalArgumentException("Choose a password you haven't used for this account.");
        }
        customer.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        customers.save(customer);
        sessions.deleteOtherSessions(customerId, SessionTokens.hash(currentToken));
    }

    /** Ends the session. Safe to call with a token that is already gone. */
    @Transactional
    public void logout(String token) {
        if (token != null) sessions.deleteByTokenHash(SessionTokens.hash(token));
    }

    private AuthResponse openSession(Customer customer) {
        String token = SessionTokens.generate();
        sessions.save(new CustomerSession(customer, SessionTokens.hash(token), Instant.now().plus(SESSION_LIFETIME)));
        return new AuthResponse(token, CustomerDto.from(customer));
    }

    private static String normaliseEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
