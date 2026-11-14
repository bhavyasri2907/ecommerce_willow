package com.cara.service;

import com.cara.dto.ProductDto;
import com.cara.dto.ProductSales;
import com.cara.model.OrderStatus;
import com.cara.model.Product;
import com.cara.repository.OrderItemRepository;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** Builds dashboard-grade ProductDtos: adds sales figures and the seller's low-stock threshold. */
@Component
public class ProductMapper {

    static final List<OrderStatus> VOID_STATUSES = List.of(OrderStatus.CANCELLED, OrderStatus.RETURNED);

    private final OrderItemRepository orderItemRepository;
    private final StoreService storeService;

    public ProductMapper(OrderItemRepository orderItemRepository, StoreService storeService) {
        this.orderItemRepository = orderItemRepository;
        this.storeService = storeService;
    }

    public ProductDto toDto(Product p) {
        return toDtos(List.of(p)).get(0);
    }

    public List<ProductDto> toDtos(Collection<Product> products) {
        Map<Long, ProductSales> sales = lifetimeSales();
        int threshold = storeService.lowStockThreshold();
        return products.stream()
                .map(p -> ProductDto.of(p, sales.getOrDefault(p.getId(), ProductSales.NONE), threshold))
                .toList();
    }

    /** Units and revenue per product across all non-cancelled, non-returned orders. */
    public Map<Long, ProductSales> lifetimeSales() {
        return toSalesMap(orderItemRepository.salesByProduct(VOID_STATUSES));
    }

    public Map<Long, ProductSales> salesSince(Instant from) {
        return toSalesMap(orderItemRepository.salesByProductSince(VOID_STATUSES, from));
    }

    private static Map<Long, ProductSales> toSalesMap(List<Object[]> rows) {
        Map<Long, ProductSales> map = new HashMap<>();
        for (Object[] row : rows) {
            long units = ((Number) row[1]).longValue();
            BigDecimal revenue = row[2] instanceof BigDecimal bd ? bd : new BigDecimal(row[2].toString());
            map.put((Long) row[0], new ProductSales(units, revenue));
        }
        return map;
    }
}
