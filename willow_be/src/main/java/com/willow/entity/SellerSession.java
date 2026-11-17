package com.willow.entity;

import jakarta.persistence.*;

import java.time.Instant;

/** A browser signed in to the seller dashboard. Holds the hash of its token, never the token itself. */
@Entity
@Table(name = "seller_sessions")
public class SellerSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "seller_id", nullable = false)
    private Seller seller;

    @Column(nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant expiresAt;

    protected SellerSession() {}

    public SellerSession(Seller seller, String tokenHash, Instant expiresAt) {
        this.seller = seller;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
    }

    public Long getId() { return id; }
    public Seller getSeller() { return seller; }
    public String getTokenHash() { return tokenHash; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getExpiresAt() { return expiresAt; }
}
