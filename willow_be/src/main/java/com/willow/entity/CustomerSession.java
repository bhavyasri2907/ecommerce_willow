package com.willow.entity;

import jakarta.persistence.*;

import java.time.Instant;

/** A signed-in browser. Holds the hash of the token the browser sends, never the token itself. */
@Entity
@Table(name = "customer_sessions")
public class CustomerSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant expiresAt;

    protected CustomerSession() {}

    public CustomerSession(Customer customer, String tokenHash, Instant expiresAt) {
        this.customer = customer;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
    }

    public Long getId() { return id; }
    public Customer getCustomer() { return customer; }
    public String getTokenHash() { return tokenHash; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getExpiresAt() { return expiresAt; }
}
