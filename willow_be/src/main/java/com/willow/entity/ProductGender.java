package com.willow.entity;

/** Who a product is for. UNISEX products appear on both the Men and Women pages. */
public enum ProductGender {
    MEN("Men"),
    WOMEN("Women"),
    UNISEX("Unisex");

    private final String label;

    ProductGender(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
