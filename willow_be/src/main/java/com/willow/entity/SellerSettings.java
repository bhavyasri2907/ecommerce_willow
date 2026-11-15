package com.willow.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;

/** Operational preferences for the seller. Single row (id = 1). */
@Entity
@Table(name = "seller_settings")
public class SellerSettings {

    public static final long SINGLETON_ID = 1L;

    @Id
    private Long id = SINGLETON_ID;

    /** A product at or below this stock level is flagged as low stock. */
    @Column(nullable = false)
    private int lowStockThreshold = 10;

    /** New storefront orders skip PENDING and go straight to CONFIRMED. */
    @Column(nullable = false)
    private boolean autoConfirmOrders = false;

    /** Dashboard shows a toast for every new order. */
    @Column(nullable = false)
    private boolean orderNotifications = true;

    /** Dashboard shows a toast when a sale pushes a product to low stock. */
    @Column(nullable = false)
    private boolean lowStockAlerts = true;

    @Column(nullable = false)
    private int returnWindowDays = 7;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal shippingFee = new BigDecimal("99");

    /** Orders at or above this subtotal ship free. */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal freeShippingThreshold = new BigDecimal("1999");

    /** Development aid: generates realistic storefront orders every few seconds. */
    @Column(nullable = false)
    private boolean simulateLiveOrders = false;

    private Instant updatedAt;

    @PrePersist
    @PreUpdate
    void touch() {
        updatedAt = Instant.now();
    }

    public Long getId() { return id; }

    public int getLowStockThreshold() { return lowStockThreshold; }
    public void setLowStockThreshold(int lowStockThreshold) { this.lowStockThreshold = lowStockThreshold; }

    public boolean isAutoConfirmOrders() { return autoConfirmOrders; }
    public void setAutoConfirmOrders(boolean autoConfirmOrders) { this.autoConfirmOrders = autoConfirmOrders; }

    public boolean isOrderNotifications() { return orderNotifications; }
    public void setOrderNotifications(boolean orderNotifications) { this.orderNotifications = orderNotifications; }

    public boolean isLowStockAlerts() { return lowStockAlerts; }
    public void setLowStockAlerts(boolean lowStockAlerts) { this.lowStockAlerts = lowStockAlerts; }

    public int getReturnWindowDays() { return returnWindowDays; }
    public void setReturnWindowDays(int returnWindowDays) { this.returnWindowDays = returnWindowDays; }

    public BigDecimal getShippingFee() { return shippingFee; }
    public void setShippingFee(BigDecimal shippingFee) { this.shippingFee = shippingFee; }

    public BigDecimal getFreeShippingThreshold() { return freeShippingThreshold; }
    public void setFreeShippingThreshold(BigDecimal freeShippingThreshold) { this.freeShippingThreshold = freeShippingThreshold; }

    public boolean isSimulateLiveOrders() { return simulateLiveOrders; }
    public void setSimulateLiveOrders(boolean simulateLiveOrders) { this.simulateLiveOrders = simulateLiveOrders; }

    public Instant getUpdatedAt() { return updatedAt; }
}
