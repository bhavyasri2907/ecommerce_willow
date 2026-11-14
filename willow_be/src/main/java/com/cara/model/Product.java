package com.cara.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "products", indexes = {
        @Index(name = "idx_products_type", columnList = "type"),
        @Index(name = "idx_products_status", columnList = "status")
})
public class Product {

    /** Product ids start at 1000. */
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "product_seq")
    @SequenceGenerator(name = "product_seq", sequenceName = "product_seq", initialValue = 1000, allocationSize = 1)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, length = 40)
    private String sku;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProductType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProductStatus status = ProductStatus.DRAFT;

    private String color;

    /** Hex swatch colour, used to render a product icon when there is no image. */
    private String hex;

    private String style;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    /** Optional "compare at" price; when higher than price the product is on sale. */
    @Column(precision = 12, scale = 2)
    private BigDecimal originalPrice;

    @Column(nullable = false)
    private int stock;

    /** Comma separated list of sizes, e.g. "XS,S,M,L". Each size is one variation. */
    @Column(length = 200)
    private String sizes;

    @Column(length = 500)
    private String imageUrl;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public Long getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public ProductType getType() { return type; }
    public void setType(ProductType type) { this.type = type; }

    public ProductStatus getStatus() { return status; }
    public void setStatus(ProductStatus status) { this.status = status; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getHex() { return hex; }
    public void setHex(String hex) { this.hex = hex; }

    public String getStyle() { return style; }
    public void setStyle(String style) { this.style = style; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BigDecimal getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(BigDecimal originalPrice) { this.originalPrice = originalPrice; }

    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }

    public String getSizes() { return sizes; }
    public void setSizes(String sizes) { this.sizes = sizes; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Instant getCreatedAt() { return createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
}
