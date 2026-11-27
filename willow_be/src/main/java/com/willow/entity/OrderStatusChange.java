package com.willow.entity;

import jakarta.persistence.*;

import java.time.Instant;

/** One step in an order's history: the status it entered, who moved it and when. */
@Entity
@Table(name = "order_status_history")
public class OrderStatusChange {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderActor actor;

    @Column(length = 300)
    private String note;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected OrderStatusChange() {}

    OrderStatusChange(Order order, OrderStatus status, OrderActor actor, String note) {
        this.order = order;
        this.status = status;
        this.actor = actor;
        this.note = note;
    }

    public Long getId() { return id; }
    public Order getOrder() { return order; }
    public OrderStatus getStatus() { return status; }
    public OrderActor getActor() { return actor; }
    public String getNote() { return note; }
    public Instant getCreatedAt() { return createdAt; }
}
