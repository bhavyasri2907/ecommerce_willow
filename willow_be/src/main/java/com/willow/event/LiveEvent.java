package com.willow.event;

import java.time.Instant;

/**
 * A change the seller dashboard should react to, e.g. {@code order.created}.
 * Published inside a transaction and only broadcast once that transaction commits.
 */
public record LiveEvent(String type, Object payload, Instant at) {

    public static final String ORDER_CREATED = "order.created";
    public static final String ORDER_UPDATED = "order.updated";
    public static final String PRODUCT_CREATED = "product.created";
    public static final String PRODUCT_UPDATED = "product.updated";
    public static final String PRODUCT_DELETED = "product.deleted";
    public static final String INVENTORY_CHANGED = "inventory.changed";
    public static final String INVENTORY_LOW = "inventory.low";
    public static final String CURATION_CHANGED = "curation.changed";
    public static final String STORE_UPDATED = "store.updated";
    public static final String SETTINGS_UPDATED = "settings.updated";

    public static LiveEvent of(String type, Object payload) {
        return new LiveEvent(type, payload, Instant.now());
    }
}
