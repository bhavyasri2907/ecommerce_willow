package com.willow.service;

import com.willow.dto.request.CreateOrderRequest;
import com.willow.dto.response.OrderDto;
import com.willow.dto.response.PageResponse;
import com.willow.entity.*;
import com.willow.event.LiveEvent;
import com.willow.event.LiveEventPublisher;
import com.willow.exception.NotFoundException;
import com.willow.repository.OrderRepository;
import com.willow.repository.ProductRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

/**
 * Order placement (storefront) and fulfilment (seller dashboard). Each order belongs to
 * one store; the seller-side methods take the seller's store id and only see its orders.
 */
@Service
public class OrderService {

    private static final Set<String> SORTABLE = Set.of("createdAt", "total", "orderNumber");

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;
    private final StoreService storeService;
    private final LiveEventPublisher events;

    private long lastOrderNumber = -1;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        InventoryService inventoryService,
                        StoreService storeService,
                        LiveEventPublisher events) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.inventoryService = inventoryService;
        this.storeService = storeService;
        this.events = events;
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderDto> search(Long storeId, String query, OrderStatus status, int page, int size,
                                         String sort, Sort.Direction direction) {
        String sortField = SORTABLE.contains(sort) ? sort : "createdAt";
        Specification<Order> spec = (root, cq, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("store").get("id"), storeId));
            if (status != null) predicates.add(cb.equal(root.get("status"), status));
            if (query != null && !query.isBlank()) {
                String like = "%" + query.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("orderNumber")), like),
                        cb.like(cb.lower(root.get("customerName")), like),
                        cb.like(cb.lower(root.get("customerEmail")), like),
                        cb.like(cb.lower(root.get("shippingCity")), like)));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
        Page<Order> result = orderRepository.findAll(spec,
                PageRequest.of(page, size, Sort.by(direction, sortField).and(Sort.by(Sort.Direction.DESC, "id"))));
        return PageResponse.of(result, OrderDto::from);
    }

    /** The store's order count per status, plus "ALL". */
    @Transactional(readOnly = true)
    public Map<String, Long> counts(Long storeId) {
        Map<String, Long> counts = new LinkedHashMap<>();
        counts.put("ALL", orderRepository.countByStoreId(storeId));
        for (OrderStatus s : OrderStatus.values()) {
            counts.put(s.name(), orderRepository.countByStoreIdAndStatus(storeId, s));
        }
        return counts;
    }

    @Transactional(readOnly = true)
    public OrderDto get(Long storeId, Long id) {
        return OrderDto.from(find(storeId, id));
    }

    /**
     * Places a shopper's bag as one order per store it draws from. Each product is locked
     * (in id order, to avoid deadlocks), checked to be live and in stock, and its stock is
     * taken; each order is priced with its own store's shipping rules. Either every order
     * is created or, if any item is unavailable, none are.
     */
    @Transactional
    public List<OrderDto> place(CreateOrderRequest req) {
        List<CreateOrderRequest.Line> lines = new ArrayList<>(req.items());
        lines.sort(Comparator.comparing(CreateOrderRequest.Line::productId));

        // Lock and check everything first, grouping the lines by the store that sells them.
        Map<Long, List<CreateOrderRequest.Line>> linesByStore = new LinkedHashMap<>();
        Map<Long, Product> products = new HashMap<>();
        for (CreateOrderRequest.Line line : lines) {
            Product p = productRepository.findByIdForUpdate(line.productId())
                    .orElseThrow(() -> new NotFoundException("product", line.productId()));
            if (p.getStatus() != ProductStatus.LIVE) {
                throw new IllegalStateException("\"" + p.getName() + "\" is not available for sale");
            }
            products.put(p.getId(), p);
            linesByStore.computeIfAbsent(p.getStore().getId(), id -> new ArrayList<>()).add(line);
        }

        List<OrderDto> placed = new ArrayList<>();
        linesByStore.forEach((storeId, storeLines) -> placed.add(placeForStore(storeId, storeLines, products, req)));
        return placed;
    }

    private OrderDto placeForStore(Long storeId, List<CreateOrderRequest.Line> lines,
                                   Map<Long, Product> products, CreateOrderRequest req) {
        SellerSettings settings = storeService.settings(storeId);

        Order order = new Order();
        order.setStore(storeService.store(storeId));
        order.setOrderNumber(nextOrderNumber());
        order.setCustomerName(req.customerName().trim());
        order.setCustomerEmail(req.customerEmail().trim().toLowerCase());
        order.setCustomerPhone(req.customerPhone());
        order.setShippingAddress(req.shippingAddress());
        order.setShippingCity(req.shippingCity());
        order.setPaymentMethod(req.paymentMethod());
        order.setStatus(settings.isAutoConfirmOrders() ? OrderStatus.CONFIRMED : OrderStatus.PENDING);

        Set<Long> touched = new LinkedHashSet<>();
        for (CreateOrderRequest.Line line : lines) {
            Product p = products.get(line.productId());
            if (p.getStock() < line.quantity()) {
                throw new IllegalStateException(p.getStock() == 0
                        ? "\"" + p.getName() + "\" is out of stock"
                        : "Only " + p.getStock() + " units of \"" + p.getName() + "\" left");
            }
            inventoryService.changeStock(p, -line.quantity(), StockMovementReason.SALE, "Order " + order.getOrderNumber());
            order.addItem(new OrderItem(p, line.size(), line.quantity()));
            touched.add(p.getId());
        }

        BigDecimal subtotal = order.getItems().stream().map(OrderItem::getLineTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal shipping = subtotal.compareTo(settings.getFreeShippingThreshold()) >= 0
                ? BigDecimal.ZERO : settings.getShippingFee();
        order.setSubtotal(subtotal);
        order.setShippingFee(shipping);
        order.setTotal(subtotal.add(shipping));

        OrderDto dto = OrderDto.from(orderRepository.saveAndFlush(order));
        events.publish(storeId, LiveEvent.ORDER_CREATED, dto);
        events.publish(storeId, LiveEvent.INVENTORY_CHANGED, Map.of("productIds", touched));
        return dto;
    }

    /** Moves one of the store's orders along its workflow. Cancelling or returning puts the stock back. */
    @Transactional
    public OrderDto updateStatus(Long storeId, Long id, OrderStatus target) {
        Order order = find(storeId, id);
        OrderStatus current = order.getStatus();
        if (current == target) return OrderDto.from(order);
        if (!current.canMoveTo(target)) {
            throw new IllegalStateException("Cannot move order " + order.getOrderNumber()
                    + " from " + current + " to " + target);
        }

        if (target.isVoid()) {
            StockMovementReason reason = target == OrderStatus.CANCELLED
                    ? StockMovementReason.CANCELLATION : StockMovementReason.RETURN;
            Set<Long> touched = new LinkedHashSet<>();
            order.getItems().stream()
                    .sorted(Comparator.comparing(i -> i.getProduct().getId()))
                    .forEach(item -> {
                        Product p = productRepository.findByIdForUpdate(item.getProduct().getId()).orElseThrow();
                        inventoryService.changeStock(p, item.getQuantity(), reason, "Order " + order.getOrderNumber());
                        touched.add(p.getId());
                    });
            events.publish(storeId, LiveEvent.INVENTORY_CHANGED, Map.of("productIds", touched));
        }

        order.setStatus(target);
        OrderDto dto = OrderDto.from(orderRepository.saveAndFlush(order));
        events.publish(storeId, LiveEvent.ORDER_UPDATED, dto);
        return dto;
    }

    /** The store's own order, or 404 - an order of another store looks exactly like a missing one. */
    private Order find(Long storeId, Long id) {
        return orderRepository.findByIdAndStoreId(id, storeId).orElseThrow(() -> new NotFoundException("order", id));
    }

    /** Sequential, human-friendly order numbers shared by the whole marketplace: WL-100001, WL-100002, ... */
    private synchronized String nextOrderNumber() {
        if (lastOrderNumber < 0) {
            String max = orderRepository.findMaxOrderNumber();
            lastOrderNumber = max == null ? 100000 : Long.parseLong(max.substring(3));
        }
        lastOrderNumber++;
        return "WL-" + lastOrderNumber;
    }
}
