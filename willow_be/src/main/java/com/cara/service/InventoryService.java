package com.cara.service;

import com.cara.dto.*;
import com.cara.event.LiveEvent;
import com.cara.event.LiveEventPublisher;
import com.cara.exception.NotFoundException;
import com.cara.model.*;
import com.cara.repository.ProductRepository;
import com.cara.repository.StockMovementRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

/** Stock levels, sales velocity and the stock movement ledger. */
@Service
public class InventoryService {

    private static final int VELOCITY_WINDOW_DAYS = 30;

    private final ProductRepository productRepository;
    private final StockMovementRepository movementRepository;
    private final ProductMapper mapper;
    private final StoreService storeService;
    private final LiveEventPublisher events;

    public InventoryService(ProductRepository productRepository,
                            StockMovementRepository movementRepository,
                            ProductMapper mapper,
                            StoreService storeService,
                            LiveEventPublisher events) {
        this.productRepository = productRepository;
        this.movementRepository = movementRepository;
        this.mapper = mapper;
        this.storeService = storeService;
        this.events = events;
    }

    /**
     * Inventory rows for every non-archived product, most urgent first.
     *
     * @param filter "low", "out", "healthy" or null for all
     */
    @Transactional(readOnly = true)
    public List<InventoryItemDto> list(String query, ProductType type, String filter) {
        Map<Long, ProductSales> recent = mapper.salesSince(Instant.now().minus(Duration.ofDays(VELOCITY_WINDOW_DAYS)));
        String q = query == null ? "" : query.trim().toLowerCase();

        return mapper.toDtos(productRepository.findByStatusNot(ProductStatus.ARCHIVED)).stream()
                .filter(p -> type == null || p.type().equals(type.name()))
                .filter(p -> q.isEmpty() || p.name().toLowerCase().contains(q)
                        || (p.sku() != null && p.sku().toLowerCase().contains(q)))
                .filter(p -> matchesFilter(p, filter))
                .map(p -> toItem(p, recent.getOrDefault(p.id(), ProductSales.NONE)))
                .sorted(Comparator
                        .comparing((InventoryItemDto i) -> urgency(i.product().stockStatus()))
                        .thenComparing(i -> i.daysOfCover() == null ? Integer.MAX_VALUE : i.daysOfCover())
                        .thenComparing(i -> i.product().name()))
                .toList();
    }

    @Transactional(readOnly = true)
    public InventorySummaryDto summary() {
        int threshold = storeService.lowStockThreshold();
        List<Product> products = productRepository.findByStatusNot(ProductStatus.ARCHIVED);
        long units = 0;
        long low = 0;
        long out = 0;
        BigDecimal value = BigDecimal.ZERO;
        for (Product p : products) {
            units += p.getStock();
            value = value.add(p.getPrice().multiply(BigDecimal.valueOf(p.getStock())));
            if (p.getStock() <= 0) out++;
            else if (p.getStock() <= threshold) low++;
        }
        return new InventorySummaryDto(products.size(), units, value, low, out, threshold);
    }

    @Transactional
    public InventoryItemDto adjust(Long productId, StockAdjustmentRequest req) {
        if (req.quantityChange() == 0) throw new IllegalArgumentException("Quantity change cannot be zero");
        if (req.reason() == StockMovementReason.SALE || req.reason() == StockMovementReason.INITIAL) {
            throw new IllegalArgumentException("Reason " + req.reason() + " is recorded automatically");
        }
        Product p = productRepository.findByIdForUpdate(productId)
                .orElseThrow(() -> new NotFoundException("product", productId));
        changeStock(p, req.quantityChange(), req.reason(), req.note());

        events.publish(LiveEvent.INVENTORY_CHANGED, Map.of("productIds", List.of(productId)));
        Map<Long, ProductSales> recent = mapper.salesSince(Instant.now().minus(Duration.ofDays(VELOCITY_WINDOW_DAYS)));
        return toItem(mapper.toDto(p), recent.getOrDefault(productId, ProductSales.NONE));
    }

    @Transactional(readOnly = true)
    public List<StockMovementDto> movements(Long productId, int limit) {
        PageRequest page = PageRequest.of(0, Math.max(1, Math.min(limit, 200)));
        List<StockMovement> rows = productId == null
                ? movementRepository.findAllByOrderByCreatedAtDescIdDesc(page)
                : movementRepository.findByProductIdOrderByCreatedAtDescIdDesc(productId, page);
        return rows.stream().map(StockMovementDto::from).toList();
    }

    /**
     * Applies a stock change to an already-locked product and records it in the ledger.
     * Publishes {@code inventory.low} when the change takes the product into low or zero stock.
     */
    @Transactional
    public void changeStock(Product p, int change, StockMovementReason reason, String note) {
        int before = p.getStock();
        int after = before + change;
        if (after < 0) {
            throw new IllegalArgumentException("Only " + before + " units of \"" + p.getName() + "\" in stock");
        }
        p.setStock(after);
        movementRepository.save(new StockMovement(p, change, reason, note));

        int threshold = storeService.lowStockThreshold();
        boolean becameLow = before > threshold && after <= threshold;
        boolean soldOut = before > 0 && after == 0;
        if (becameLow || soldOut) {
            events.publish(LiveEvent.INVENTORY_LOW, Map.of(
                    "productId", p.getId(), "name", p.getName(), "stock", after, "threshold", threshold));
        }
    }

    private static InventoryItemDto toItem(ProductDto p, ProductSales recent) {
        double velocity = recent.units() / (double) VELOCITY_WINDOW_DAYS;
        Integer cover = velocity > 0 ? (int) Math.floor(p.stock() / velocity) : null;
        BigDecimal value = p.price().multiply(BigDecimal.valueOf(p.stock()));
        return new InventoryItemDto(p, recent.units(), Math.round(velocity * 100) / 100.0, cover, value);
    }

    private static boolean matchesFilter(ProductDto p, String filter) {
        if (filter == null || filter.isBlank() || filter.equalsIgnoreCase("all")) return true;
        return switch (filter.toLowerCase()) {
            case "low" -> p.stockStatus().equals("LOW_STOCK");
            case "out" -> p.stockStatus().equals("OUT_OF_STOCK");
            case "healthy" -> p.stockStatus().equals("IN_STOCK");
            default -> true;
        };
    }

    private static int urgency(String stockStatus) {
        return switch (stockStatus) {
            case "OUT_OF_STOCK" -> 0;
            case "LOW_STOCK" -> 1;
            default -> 2;
        };
    }
}
