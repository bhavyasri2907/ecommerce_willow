package com.willow.entity;

import jakarta.persistence.*;

/**
 * A seller-approved link from a top to a pair of pants. The AI style
 * assistant is only ever allowed to rank and explain rows that already
 * exist here — it never invents a pairing that a seller hasn't approved.
 */
@Entity
@Table(name = "recommendations",
       uniqueConstraints = @UniqueConstraint(columnNames = {"top_id", "pants_id"}))
public class Recommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "top_id", nullable = false)
    private Product top;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pants_id", nullable = false)
    private Product pants;

    public Recommendation() {}

    public Recommendation(Product top, Product pants) {
        this.top = top;
        this.pants = pants;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Product getTop() { return top; }
    public void setTop(Product top) { this.top = top; }

    public Product getPants() { return pants; }
    public void setPants(Product pants) { this.pants = pants; }
}
