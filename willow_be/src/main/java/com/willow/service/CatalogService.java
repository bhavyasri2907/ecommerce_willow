package com.willow.service;

import com.willow.dto.request.BulkProductRequest;
import com.willow.dto.request.ProductRequest;
import com.willow.dto.response.BulkResult;
import com.willow.dto.response.CatalogSummaryDto;
import com.willow.dto.response.PageResponse;
import com.willow.dto.response.ProductDto;
import com.willow.entity.*;
import com.willow.event.LiveEvent;
import com.willow.event.LiveEventPublisher;
import com.willow.exception.NotFoundException;
import com.willow.mapper.ProductMapper;
import com.willow.repository.OrderItemRepository;
import com.willow.repository.ProductRepository;
import com.willow.repository.CuratedPickRepository;
import com.willow.repository.StockMovementRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Seller-side product management: search, create, edit, publish/archive and delete.
 * Every method takes the seller's store id and only ever sees that store's products.
 */
@Service
public class CatalogService {

    private static final Set<String> SORTABLE = Set.of("name", "price", "stock", "createdAt", "updatedAt", "sold");
    private static final Map<ProductType, String> SKU_PREFIX = Map.of(
            ProductType.TOP, "TP", ProductType.PANTS, "BT", ProductType.SHOES, "FW",
            ProductType.BAG, "BG", ProductType.ACCESSORY, "AC");

    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final CuratedPickRepository curatedPickRepository;
    private final CurationService curationService;
    private final StockMovementRepository stockMovementRepository;
    private final ProductMapper mapper;
    private final StoreService storeService;
    private final LiveEventPublisher events;

    public CatalogService(ProductRepository productRepository,
                          OrderItemRepository orderItemRepository,
                          CuratedPickRepository curatedPickRepository,
                          CurationService curationService,
                          StockMovementRepository stockMovementRepository,
                          ProductMapper mapper,
                          StoreService storeService,
                          LiveEventPublisher events) {
        this.productRepository = productRepository;
        this.orderItemRepository = orderItemRepository;
        this.curatedPickRepository = curatedPickRepository;
        this.curationService = curationService;
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
    public PageResponse<ProductDto> search(Long storeId, String query, ProductType type, ProductStatus status,
                                           String stock, int page, int size, String sort, Sort.Direction direction) {
        String sortField = SORTABLE.contains(sort) ? sort : "createdAt";
        Specification<Product> spec = inStore(storeId)
                .and(matching(query, type, status, stock, storeService.lowStockThreshold(storeId)));

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

    /** Status and stock counts, optionally scoped to one category; byType always covers the store's whole catalogue. */
    @Transactional(readOnly = true)
    public CatalogSummaryDto summary(Long storeId, ProductType type) {
        int threshold = storeService.lowStockThreshold(storeId);
        Specification<Product> store = inStore(storeId);
        Specification<Product> scope = store.and(ofType(type));
        Specification<Product> active = scope.and(notArchived());

        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (ProductStatus s : ProductStatus.values()) {
            byStatus.put(s.name(), productRepository.count(scope.and(hasStatus(s))));
        }
        List<CatalogSummaryDto.CategoryCount> byType = Arrays.stream(ProductType.values())
                .map(t -> new CatalogSummaryDto.CategoryCount(t.name(), t.getLabel(),
                        productRepository.count(store.and(ofType(t)))))
                .toList();

        long total = productRepository.count(scope);
        long out = productRepository.count(active.and(stockBetween(0, 0)));
        long low = threshold < 1 ? 0 : productRepository.count(active.and(stockBetween(1, threshold)));
        return new CatalogSummaryDto(total, byStatus, byType, low, out, threshold);
    }

    @Transactional(readOnly = true)
    public ProductDto get(Long storeId, Long id) {
        return mapper.toDto(find(storeId, id));
    }

    @Transactional
    public ProductDto create(Long storeId, ProductRequest req) {
        Product p = new Product();
        p.setStore(storeService.store(storeId));
        apply(p, req);
        p.setStatus(req.status() == null ? ProductStatus.DRAFT : req.status());
        p.setStock(req.stock());
        p.setSku(resolveSku(storeId, req.sku(), req.type(), null));
        productRepository.saveAndFlush(p);
        if (p.getStock() > 0) {
            stockMovementRepository.save(new StockMovement(p, p.getStock(), StockMovementReason.INITIAL, "Opening stock"));
        }
        if (req.curatedPickIds() != null) curationService.setPicks(p, req.curatedPickIds());
        ProductDto dto = mapper.toDto(p);
        events.publish(storeId, LiveEvent.PRODUCT_CREATED, dto);
        return dto;
    }

    @Transactional
    public ProductDto update(Long storeId, Long id, ProductRequest req) {
        Product p = productRepository.findByIdForUpdate(id)
                .filter(product -> product.getStore().getId().equals(storeId))
                .orElseThrow(() -> new NotFoundException("product", id));
        apply(p, req);
        if (req.status() != null) p.setStatus(req.status());
        p.setSku(resolveSku(storeId, req.sku(), req.type(), p));

        int delta = req.stock() - p.getStock();
        if (delta != 0) {
            p.setStock(req.stock());
            stockMovementRepository.save(new StockMovement(p, delta, StockMovementReason.ADJUSTMENT, "Edited on product form"));
        }
        productRepository.saveAndFlush(p);
        // null leaves the Curated Fit as it is; a list (even an empty one) replaces it.
        if (req.curatedPickIds() != null) curationService.setPicks(p, req.curatedPickIds());
        ProductDto dto = mapper.toDto(p);
        events.publish(storeId, LiveEvent.PRODUCT_UPDATED, dto);
        if (delta != 0) events.publish(storeId, LiveEvent.INVENTORY_CHANGED, Map.of("productIds", List.of(id)));
        return dto;
    }

    @Transactional
    public ProductDto changeStatus(Long storeId, Long id, ProductStatus status) {
        Product p = find(storeId, id);
        p.setStatus(status);
        productRepository.saveAndFlush(p);
        ProductDto dto = mapper.toDto(p);
        events.publish(storeId, LiveEvent.PRODUCT_UPDATED, dto);
        return dto;
    }

    /** Products that appear on orders cannot be deleted (order history must stay intact) - archive them instead. */
    @Transactional
    public void delete(Long storeId, Long id) {
        Product p = find(storeId, id);
        if (orderItemRepository.existsByProductId(id)) {
            throw new IllegalStateException("\"" + p.getName() + "\" has orders and cannot be deleted. Archive it instead.");
        }
        remove(p);
        events.publish(storeId, LiveEvent.PRODUCT_DELETED, Map.of("id", id));
    }

    /** Ids that are unknown, or belong to another store, are skipped. */
    @Transactional
    public BulkResult bulk(Long storeId, BulkProductRequest req) {
        int updated = 0;
        int skipped = 0;
        for (Long id : new LinkedHashSet<>(req.ids())) {
            Optional<Product> found = productRepository.findByIdAndStoreId(id, storeId);
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
                    remove(p);
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
        events.publish(storeId, LiveEvent.PRODUCT_UPDATED, Map.of("ids", req.ids()));
        return new BulkResult(updated, skipped, message);
    }

    /** The store's own product, or 404 - a product of another store looks exactly like a missing one. */
    private Product find(Long storeId, Long id) {
        return productRepository.findByIdAndStoreId(id, storeId).orElseThrow(() -> new NotFoundException("product", id));
    }

    private void remove(Product p) {
        curatedPickRepository.deleteAllInvolving(p.getId());
        stockMovementRepository.deleteByProductId(p.getId());
        productRepository.delete(p);
    }

    private static void apply(Product p, ProductRequest req) {
        p.setName(req.name().trim());
        p.setType(req.type());
        p.setColor(blankToNull(req.color()));
        p.setHex(req.hex() == null || req.hex().isBlank() ? "#B4636F" : req.hex().toUpperCase());
        p.setStyle(blankToNull(req.style()));
        p.setPrice(req.price());
        p.setOriginalPrice(req.originalPrice() != null && req.originalPrice().signum() > 0 ? req.originalPrice() : null);
        p.setGender(req.gender() == null ? ProductGender.UNISEX : req.gender());
        p.setBrand(blankToNull(req.brand()));
        p.setMaterial(blankToNull(req.material()));
        p.setImages(photosOf(req));
        p.setDescription(blankToNull(req.description()));
        p.setSizes(req.sizes() == null || req.sizes().isEmpty() ? null
                : String.join(",", req.sizes().stream().map(String::trim).distinct().toList()));
    }

    /** The request's photos in order, without blanks or repeats. Falls back to the single imageUrl. */
    private static List<String> photosOf(ProductRequest req) {
        if (req.images() != null) {
            return req.images().stream().map(String::trim).filter(s -> !s.isEmpty()).distinct().toList();
        }
        String single = blankToNull(req.imageUrl());
        return single == null ? List.of() : List.of(single);
    }

    /**
     * The SKU to store: the one asked for (it must be free within the store), else the product's
     * current one, else a newly generated one.
     *
     * @param existing the product being edited, or null when creating
     */
    private String resolveSku(Long storeId, String requested, ProductType type, Product existing) {
        if (requested != null && !requested.isBlank()) {
            String sku = requested.trim().toUpperCase();
            boolean taken = existing == null
                    ? productRepository.existsByStoreIdAndSkuIgnoreCase(storeId, sku)
                    : productRepository.existsByStoreIdAndSkuIgnoreCaseAndIdNot(storeId, sku, existing.getId());
            if (taken) throw new IllegalArgumentException("SKU " + sku + " is already used by another of your products");
            return sku;
        }
        if (existing != null && existing.getSku() != null) return existing.getSku();
        String sku;
        do {
            sku = "WL-" + SKU_PREFIX.get(type) + "-" + ThreadLocalRandom.current().nextInt(1000, 10000);
        } while (productRepository.existsByStoreIdAndSkuIgnoreCase(storeId, sku));
        return sku;
    }

    // ---- query building blocks -------------------------------------------------

    private static Specification<Product> inStore(Long storeId) {
        return (root, cq, cb) -> cb.equal(root.get("store").get("id"), storeId);
    }

    /** Matches every product when {@code type} is null. */
    private static Specification<Product> ofType(ProductType type) {
        return (root, cq, cb) -> type == null ? cb.conjunction() : cb.equal(root.get("type"), type);
    }

    private static Specification<Product> hasStatus(ProductStatus status) {
        return (root, cq, cb) -> cb.equal(root.get("status"), status);
    }

    private static Specification<Product> notArchived() {
        return (root, cq, cb) -> cb.notEqual(root.get("status"), ProductStatus.ARCHIVED);
    }

    private static Specification<Product> stockBetween(int min, int max) {
        return (root, cq, cb) -> cb.between(root.get("stock"), min, max);
    }

    /** The dashboard's product list filters: free-text search, category, status and stock level. */
    private static Specification<Product> matching(String query, ProductType type, ProductStatus status,
                                                   String stock, int threshold) {
        Specification<Product> spec = ofType(type);
        if (query != null && !query.isBlank()) {
            String like = "%" + query.trim().toLowerCase() + "%";
            spec = spec.and((root, cq, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")), like),
                    cb.like(cb.lower(root.get("sku")), like),
                    cb.like(cb.lower(root.get("color")), like)));
        }
        if (status != null) {
            spec = spec.and(hasStatus(status));
        } else if (stock != null) {
            spec = spec.and(notArchived());
        }
        if ("low".equalsIgnoreCase(stock)) {
            spec = spec.and(stockBetween(1, threshold));
        } else if ("out".equalsIgnoreCase(stock)) {
            spec = spec.and((root, cq, cb) -> cb.lessThanOrEqualTo(root.get("stock"), 0));
        }
        return spec;
    }

    private static String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
