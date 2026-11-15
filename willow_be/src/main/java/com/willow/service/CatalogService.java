package com.willow.service;

import com.willow.mapper.ProductMapper;
import com.willow.dto.request.*;
import com.willow.dto.response.*;
import com.willow.event.LiveEvent;
import com.willow.event.LiveEventPublisher;
import com.willow.exception.NotFoundException;
import com.willow.entity.*;
import com.willow.repository.OrderItemRepository;
import com.willow.repository.ProductRepository;
import com.willow.repository.RecommendationRepository;
import com.willow.repository.StockMovementRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

/** Seller-side product management: search, create, edit, publish/archive and delete. */
@Service
public class CatalogService {

    private static final Set<String> SORTABLE = Set.of("name", "price", "stock", "createdAt", "updatedAt", "sold");
    private static final Map<ProductType, String> SKU_PREFIX = Map.of(
            ProductType.TOP, "TP", ProductType.PANTS, "BT", ProductType.SHOES, "FW",
            ProductType.BAG, "BG", ProductType.ACCESSORY, "AC");

    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final RecommendationRepository recommendationRepository;
    private final StockMovementRepository stockMovementRepository;
    private final ProductMapper mapper;
    private final StoreService storeService;
    private final LiveEventPublisher events;

    public CatalogService(ProductRepository productRepository,
                          OrderItemRepository orderItemRepository,
                          RecommendationRepository recommendationRepository,
                          StockMovementRepository stockMovementRepository,
                          ProductMapper mapper,
                          StoreService storeService,
                          LiveEventPublisher events) {
        this.productRepository = productRepository;
        this.orderItemRepository = orderItemRepository;
        this.recommendationRepository = recommendationRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.mapper = mapper;
        this.storeService = storeService;
        this.events = events;
    }

    /**
     * @param stock "low" (in stock but at/below threshold) or "out" (zero stock); null for any
     * @param sort  one of name, price, stock, createdAt, updatedAt, sold
     */
    @Transactional(readOnly = true)
    public PageResponse<ProductDto> search(String query, ProductType type, ProductStatus status, String stock,
                                           int page, int size, String sort, Sort.Direction direction) {
        String sortField = SORTABLE.contains(sort) ? sort : "createdAt";
        Specification<Product> spec = buildSpec(query, type, status, stock, storeService.lowStockThreshold());

        if (!"sold".equals(sortField)) {
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField).and(Sort.by("id")));
            Page<Product> result = productRepository.findAll(spec, pageable);
            List<ProductDto> dtos = mapper.toDtos(result.getContent());
            return new PageResponse<>(dtos, result.getNumber(), result.getSize(),
                    result.getTotalElements(), result.getTotalPages());
        }

        // Units sold is an aggregate over order items, so this sort is done in memory.
        Comparator<ProductDto> bySold = Comparator.comparingLong(ProductDto::unitsSold);
        List<ProductDto> all = new ArrayList<>(mapper.toDtos(productRepository.findAll(spec)));
        all.sort(direction == Sort.Direction.ASC ? bySold : bySold.reversed());
        int from = Math.min(page * size, all.size());
        int to = Math.min(from + size, all.size());
        int totalPages = (int) Math.ceil(all.size() / (double) size);
        return new PageResponse<>(all.subList(from, to), page, size, all.size(), totalPages);
    }

    /** Status and stock counts, optionally scoped to one category; byType always covers the whole catalogue. */
    @Transactional(readOnly = true)
    public CatalogSummaryDto summary(ProductType type) {
        int threshold = storeService.lowStockThreshold();
        ProductStatus archived = ProductStatus.ARCHIVED;
        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (ProductStatus s : ProductStatus.values()) {
            byStatus.put(s.name(), type == null
                    ? productRepository.countByStatus(s)
                    : productRepository.countByTypeAndStatus(type, s));
        }
        List<CatalogSummaryDto.CategoryCount> byType = Arrays.stream(ProductType.values())
                .map(t -> new CatalogSummaryDto.CategoryCount(t.name(), t.getLabel(), productRepository.countByType(t)))
                .toList();
        long total = type == null ? productRepository.count() : productRepository.countByType(type);
        long out = type == null
                ? productRepository.countByStockAndStatusNot(0, archived)
                : productRepository.countByTypeAndStockAndStatusNot(type, 0, archived);
        long low = threshold < 1 ? 0 : type == null
                ? productRepository.countByStockBetweenAndStatusNot(1, threshold, archived)
                : productRepository.countByTypeAndStockBetweenAndStatusNot(type, 1, threshold, archived);
        return new CatalogSummaryDto(total, byStatus, byType, low, out, threshold);
    }

    @Transactional(readOnly = true)
    public ProductDto get(Long id) {
        return mapper.toDto(find(id));
    }

    @Transactional
    public ProductDto create(ProductRequest req) {
        Product p = new Product();
        apply(p, req);
        p.setStatus(req.status() == null ? ProductStatus.DRAFT : req.status());
        p.setStock(req.stock());
        p.setSku(resolveSku(req.sku(), req.type(), null));
        productRepository.saveAndFlush(p);

        if (p.getStock() > 0) {
            stockMovementRepository.save(new StockMovement(p, p.getStock(), StockMovementReason.INITIAL, "Opening stock"));
        }
        ProductDto dto = mapper.toDto(p);
        events.publish(LiveEvent.PRODUCT_CREATED, dto);
        return dto;
    }

    @Transactional
    public ProductDto update(Long id, ProductRequest req) {
        Product p = productRepository.findByIdForUpdate(id).orElseThrow(() -> new NotFoundException("product", id));
        apply(p, req);
        if (req.status() != null) p.setStatus(req.status());
        p.setSku(resolveSku(req.sku(), req.type(), id));

        int delta = req.stock() - p.getStock();
        if (delta != 0) {
            p.setStock(req.stock());
            stockMovementRepository.save(new StockMovement(p, delta, StockMovementReason.ADJUSTMENT, "Edited on product form"));
        }
        productRepository.saveAndFlush(p);

        ProductDto dto = mapper.toDto(p);
        events.publish(LiveEvent.PRODUCT_UPDATED, dto);
        if (delta != 0) events.publish(LiveEvent.INVENTORY_CHANGED, Map.of("productIds", List.of(id)));
        return dto;
    }

    @Transactional
    public ProductDto changeStatus(Long id, ProductStatus status) {
        Product p = find(id);
        p.setStatus(status);
        productRepository.saveAndFlush(p);
        ProductDto dto = mapper.toDto(p);
        events.publish(LiveEvent.PRODUCT_UPDATED, dto);
        return dto;
    }

    /** Products that appear on orders cannot be deleted (order history must stay intact) - archive them instead. */
    @Transactional
    public void delete(Long id) {
        Product p = find(id);
        if (orderItemRepository.existsByProductId(id)) {
            throw new IllegalStateException("\"" + p.getName() + "\" has orders and cannot be deleted. Archive it instead.");
        }
        recommendationRepository.deleteAllInvolving(id);
        stockMovementRepository.deleteByProductId(id);
        productRepository.delete(p);
        events.publish(LiveEvent.PRODUCT_DELETED, Map.of("id", id));
    }

    @Transactional
    public BulkResult bulk(BulkProductRequest req) {
        int updated = 0;
        int skipped = 0;
        for (Long id : new LinkedHashSet<>(req.ids())) {
            Optional<Product> found = productRepository.findById(id);
            if (found.isEmpty()) {
                skipped++;
                continue;
            }
            Product p = found.get();
            switch (req.action()) {
                case PUBLISH -> p.setStatus(ProductStatus.LIVE);
                case DRAFT -> p.setStatus(ProductStatus.DRAFT);
                case ARCHIVE -> p.setStatus(ProductStatus.ARCHIVED);
                case DELETE -> {
                    if (orderItemRepository.existsByProductId(id)) {
                        skipped++;
                        continue;
                    }
                    recommendationRepository.deleteAllInvolving(id);
                    stockMovementRepository.deleteByProductId(id);
                    productRepository.delete(p);
                }
            }
            updated++;
        }
        productRepository.flush();

        String verb = switch (req.action()) {
            case PUBLISH -> "published";
            case DRAFT -> "moved to draft";
            case ARCHIVE -> "archived";
            case DELETE -> "deleted";
        };
        String message = updated + " product" + (updated == 1 ? "" : "s") + " " + verb
                + (skipped > 0 ? ", " + skipped + " skipped" + (req.action() == BulkProductRequest.Action.DELETE
                ? " (products with orders can only be archived)" : "") : "");
        events.publish(LiveEvent.PRODUCT_UPDATED, Map.of("ids", req.ids()));
        return new BulkResult(updated, skipped, message);
    }

    private Product find(Long id) {
        return productRepository.findById(id).orElseThrow(() -> new NotFoundException("product", id));
    }

    private static void apply(Product p, ProductRequest req) {
        p.setName(req.name().trim());
        p.setType(req.type());
        p.setColor(blankToNull(req.color()));
        p.setHex(req.hex() == null || req.hex().isBlank() ? "#B4636F" : req.hex().toUpperCase());
        p.setStyle(blankToNull(req.style()));
        p.setPrice(req.price());
        p.setOriginalPrice(req.originalPrice() != null && req.originalPrice().signum() > 0 ? req.originalPrice() : null);
        p.setImageUrl(blankToNull(req.imageUrl()));
        p.setDescription(blankToNull(req.description()));
        p.setSizes(req.sizes() == null || req.sizes().isEmpty() ? null
                : String.join(",", req.sizes().stream().map(String::trim).distinct().toList()));
    }

    private String resolveSku(String requested, ProductType type, Long existingId) {
        if (requested != null && !requested.isBlank()) {
            String sku = requested.trim().toUpperCase();
            boolean taken = existingId == null
                    ? productRepository.existsBySkuIgnoreCase(sku)
                    : productRepository.existsBySkuIgnoreCaseAndIdNot(sku, existingId);
            if (taken) throw new IllegalArgumentException("SKU " + sku + " is already used by another product");
            return sku;
        }
        if (existingId != null) {
            String current = productRepository.findById(existingId).map(Product::getSku).orElse(null);
            if (current != null) return current;
        }
        String sku;
        do {
            sku = "WL-" + SKU_PREFIX.get(type) + "-" + ThreadLocalRandom.current().nextInt(1000, 10000);
        } while (productRepository.existsBySkuIgnoreCase(sku));
        return sku;
    }

    private static Specification<Product> buildSpec(String query, ProductType type, ProductStatus status,
                                                    String stock, int threshold) {
        return (root, cq, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (query != null && !query.isBlank()) {
                String like = "%" + query.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), like),
                        cb.like(cb.lower(root.get("sku")), like),
                        cb.like(cb.lower(root.get("color")), like)));
            }
            if (type != null) predicates.add(cb.equal(root.get("type"), type));
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            } else if (stock != null) {
                predicates.add(cb.notEqual(root.get("status"), ProductStatus.ARCHIVED));
            }
            if ("low".equalsIgnoreCase(stock)) {
                predicates.add(cb.greaterThan(root.get("stock"), 0));
                predicates.add(cb.lessThanOrEqualTo(root.get("stock"), threshold));
            } else if ("out".equalsIgnoreCase(stock)) {
                predicates.add(cb.lessThanOrEqualTo(root.get("stock"), 0));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    private static String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
