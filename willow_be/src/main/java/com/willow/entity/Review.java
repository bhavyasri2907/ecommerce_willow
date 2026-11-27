package com.willow.entity;

import jakarta.persistence.*;

import java.time.Instant;

/** A shopper's rating and review of a product they bought. One per shopper per product. */
@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false, updatable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false, updatable = false)
    private Customer customer;

    /** 1 to 5 stars. */
    @Column(nullable = false)
    private short rating;

    @Column(length = 120)
    private String title;

    @Column(length = 1000)
    private String comment;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    protected Review() {}

    public Review(Product product, Customer customer) {
        this.product = product;
        this.customer = customer;
    }

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public Product getProduct() { return product; }
    public Customer getCustomer() { return customer; }

    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = (short) rating; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    /** True once the shopper has changed the review after first posting it. */
    public boolean isEdited() {
        return updatedAt != null && createdAt != null && updatedAt.isAfter(createdAt.plusSeconds(60));
    }
}
