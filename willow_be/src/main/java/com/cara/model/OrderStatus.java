package com.cara.model;

import java.util.List;
import java.util.Map;

/**
 * Fulfilment workflow. Each status lists the statuses a seller may move an
 * order to next; anything else is rejected by OrderService.
 */
public enum OrderStatus {
    PENDING,
    CONFIRMED,
    PACKED,
    SHIPPED,
    DELIVERED,
    CANCELLED,
    RETURNED;

    private static final Map<OrderStatus, List<OrderStatus>> TRANSITIONS = Map.of(
            PENDING, List.of(CONFIRMED, CANCELLED),
            CONFIRMED, List.of(PACKED, CANCELLED),
            PACKED, List.of(SHIPPED, CANCELLED),
            SHIPPED, List.of(DELIVERED, RETURNED),
            DELIVERED, List.of(RETURNED),
            CANCELLED, List.of(),
            RETURNED, List.of()
    );

    public List<OrderStatus> nextStatuses() {
        return TRANSITIONS.get(this);
    }

    public boolean canMoveTo(OrderStatus target) {
        return TRANSITIONS.get(this).contains(target);
    }

    /** Orders in these states do not count towards revenue and hand their stock back. */
    public boolean isVoid() {
        return this == CANCELLED || this == RETURNED;
    }
}
