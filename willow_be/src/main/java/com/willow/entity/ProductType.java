package com.willow.entity;

/** Catalogue categories. The label is what the dashboard and storefront display. */
public enum ProductType {
    TOP("Tops"),
    PANTS("Bottoms"),
    SHOES("Footwear"),
    BAG("Bags"),
    ACCESSORY("Accessories");

    private final String label;

    ProductType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
