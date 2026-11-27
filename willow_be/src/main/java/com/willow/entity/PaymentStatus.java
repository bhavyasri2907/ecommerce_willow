package com.willow.entity;

/** Whether the money for an order has changed hands. Independent of fulfilment status. */
public enum PaymentStatus {
    /** Not collected yet - a Cash on Delivery order before it is delivered. */
    PENDING,
    /** Collected. */
    PAID,
    /** Handed back after a return. */
    REFUNDED,
    /** Cancelled before any money changed hands. */
    VOID
}
