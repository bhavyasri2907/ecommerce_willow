package com.willow.entity;

import jakarta.persistence.*;

import java.time.Instant;

/**
 * One piece of a product's Curated Fit: the seller of {@code product} suggests wearing
 * {@code pick} with it. The pick can be any product on Willow, including another store's.
 */
@Entity
@Table(name = "curated_picks",
       uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "pick_id"}))
public class CuratedPick {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The seller's own product that the fit is built around. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /** The product suggested alongside it. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pick_id", nullable = false)
    private Product pick;

    /** Order within the fit, lowest first. */
    @Column(nullable = false)
    private int position;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected CuratedPick() {}

    public CuratedPick(Product product, Product pick, int position) {
        this.product = product;
        this.pick = pick;
        this.position = position;
    }

    public Long getId() { return id; }
    public Product getProduct() { return product; }
    public Product getPick() { return pick; }
    public int getPosition() { return position; }
    public void setPosition(int position) { this.position = position; }
    public Instant getCreatedAt() { return createdAt; }
}
