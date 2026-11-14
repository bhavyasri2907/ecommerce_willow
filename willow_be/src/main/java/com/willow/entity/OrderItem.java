package com.willow.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;

/**
 * A line on an order. Name and unit price are snapshotted at checkout so that
 * later catalogue edits never rewrite order history.
 */
@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private String productName;

    @Column(length = 20)
    private String size;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    protected OrderItem() {}

    public OrderItem(Product product, String size, int quantity) {
        this.product = product;
        this.productName = product.getName();
        this.size = size;
        this.quantity = quantity;
        this.unitPrice = product.getPrice();
    }

    public BigDecimal getLineTotal() {
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }

    public Long getId() { return id; }

    public Order getOrder() { return order; }
    void setOrder(Order order) { this.order = order; }

    public Product getProduct() { return product; }
    public String getProductName() { return productName; }
    public String getSize() { return size; }
    public int getQuantity() { return quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
}
