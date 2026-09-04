package com.cara.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
public class Product {

    @Id
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductType type;

    private String color;

    // hex swatch color used by the frontend to render the product icon
    private String hex;

    private String style;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(length = 500)
    private String description;

    public Product() {}

    public Product(Long id, String name, ProductType type, String color, String hex,
                    String style, BigDecimal price, String description) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.color = color;
        this.hex = hex;
        this.style = style;
        this.price = price;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public ProductType getType() { return type; }
    public void setType(ProductType type) { this.type = type; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getHex() { return hex; }
    public void setHex(String hex) { this.hex = hex; }

    public String getStyle() { return style; }
    public void setStyle(String style) { this.style = style; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
