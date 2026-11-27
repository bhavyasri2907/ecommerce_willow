package com.willow.event;

import java.time.Instant;

/**
 * A change one store's dashboard should react to, e.g. {@code order.created}.
 * Published inside a transaction and only broadcast once that transaction commits,
 * and only to dashboards signed in to {@code storeId}.
 */
public record LiveEvent(Long storeId, String type, Object payload, Instant at) {

    public static final String ORDER_CREATED = "order.created";
    public static final String ORDER_UPDATED = "order.updated";
    /** Sent alongside order.updated when the shopper cancels, so the dashboard can alert the seller. */
    public static final String ORDER_CANCELLED_BY_CUSTOMER = "order.cancelled";
    public static final String PRODUCT_CREATED = "product.created";
    public static final String PRODUCT_UPDATED = "product.updated";
    public static final String PRODUCT_DELETED = "product.deleted";
    public static final String INVENTORY_CHANGED = "inventory.changed";
    public static final String INVENTORY_LOW = "inventory.low";
    public static final String CURATION_CHANGED = "curation.changed";
    public static final String STORE_UPDATED = "store.updated";
    public static final String SETTINGS_UPDATED = "settings.updated";

    public static LiveEvent of(Long storeId, String type, Object payload) {
        return new LiveEvent(storeId, type, payload, Instant.now());
    }
}
