package com.willow.dto.response;

import java.math.BigDecimal;

/** Units sold and revenue for one product over some period. */
public record ProductSales(long units, BigDecimal revenue) {

    public static final ProductSales NONE = new ProductSales(0, BigDecimal.ZERO);
}
