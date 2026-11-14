package com.cara.model;

import jakarta.persistence.*;

import java.time.Instant;

/** Append-only ledger of every change to a product's stock level. */
@Entity
@Table(name = "stock_movements", indexes = @Index(name = "idx_stock_mv_created", columnList = "createdAt"))
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /** Signed quantity: positive adds stock, negative removes it. */
    @Column(nullable = false)
    private int quantityChange;

    @Column(nullable = false)
    private int balanceAfter;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StockMovementReason reason;

    @Column(length = 300)
    private String note;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    protected StockMovement() {}

    /** Create after the product's stock has been updated; the new level is recorded as the balance. */
    public StockMovement(Product product, int quantityChange, StockMovementReason reason, String note) {
        this.product = product;
        this.quantityChange = quantityChange;
        this.balanceAfter = product.getStock();
        this.reason = reason;
        this.note = note;
    }

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public Product getProduct() { return product; }
    public int getQuantityChange() { return quantityChange; }
    public int getBalanceAfter() { return balanceAfter; }
    public StockMovementReason getReason() { return reason; }
    public String getNote() { return note; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
