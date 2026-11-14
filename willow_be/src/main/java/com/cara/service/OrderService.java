package com.cara.service;

import com.cara.dto.CreateOrderRequest;
import com.cara.dto.OrderDto;
import com.cara.dto.PageResponse;
import com.cara.event.LiveEvent;
import com.cara.event.LiveEventPublisher;
import com.cara.exception.NotFoundException;
import com.cara.model.*;
import com.cara.repository.OrderRepository;
import com.cara.repository.ProductRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

/** Order placement (storefront) and fulfilment (seller dashboard). */
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
    public PageResponse<OrderDto> search(String query, OrderStatus status, int page, int size,
                                         String sort, Sort.Direction direction) {
        String sortField = SORTABLE.contains(sort) ? sort : "createdAt";
        Specification<CustomerOrder> spec = (root, cq, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
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
        Page<CustomerOrder> result = orderRepository.findAll(spec,
                PageRequest.of(page, size, Sort.by(direction, sortField).and(Sort.by(Sort.Direction.DESC, "id"))));
        return PageResponse.of(result, OrderDto::from);
    }

    /** Order count per status, plus "ALL". */
    @Transactional(readOnly = true)
    public Map<String, Long> counts() {
        Map<String, Long> counts = new LinkedHashMap<>();
        counts.put("ALL", orderRepository.count());
        for (OrderStatus s : OrderStatus.values()) {
            counts.put(s.name(), orderRepository.countByStatus(s));
        }
        return counts;
    }

    @Transactional(readOnly = true)
    public OrderDto get(Long id) {
        return OrderDto.from(find(id));
    }

    /**
     * Places an order: locks each product (in id order, to avoid deadlocks), checks it is live
     * and in stock, takes the stock, and prices the order with the seller's shipping rules.
     */
    @Transactional
    public OrderDto place(CreateOrderRequest req) {
        SellerSettings settings = storeService.settings();

        CustomerOrder order = new CustomerOrder();
        order.setOrderNumber(nextOrderNumber());
        order.setCustomerName(req.customerName().trim());
        order.setCustomerEmail(req.customerEmail().trim().toLowerCase());
        order.setCustomerPhone(req.customerPhone());
        order.setShippingAddress(req.shippingAddress());
        order.setShippingCity(req.shippingCity());
        order.setPaymentMethod(req.paymentMethod());
        order.setStatus(settings.isAutoConfirmOrders() ? OrderStatus.CONFIRMED : OrderStatus.PENDING);

        List<CreateOrderRequest.Line> lines = new ArrayList<>(req.items());
        lines.sort(Comparator.comparing(CreateOrderRequest.Line::productId));

        Set<Long> touched = new LinkedHashSet<>();
        for (CreateOrderRequest.Line line : lines) {
            Product p = productRepository.findByIdForUpdate(line.productId())
                    .orElseThrow(() -> new NotFoundException("product", line.productId()));
            if (p.getStatus() != ProductStatus.LIVE) {
                throw new IllegalStateException("\"" + p.getName() + "\" is not available for sale");
            }
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
        events.publish(LiveEvent.ORDER_CREATED, dto);
        events.publish(LiveEvent.INVENTORY_CHANGED, Map.of("productIds", touched));
        return dto;
    }

    /** Moves an order along its workflow. Cancelling or returning puts the stock back. */
    @Transactional
    public OrderDto updateStatus(Long id, OrderStatus target) {
        CustomerOrder order = find(id);
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
            events.publish(LiveEvent.INVENTORY_CHANGED, Map.of("productIds", touched));
        }

        order.setStatus(target);
        OrderDto dto = OrderDto.from(orderRepository.saveAndFlush(order));
        events.publish(LiveEvent.ORDER_UPDATED, dto);
        return dto;
    }

    private CustomerOrder find(Long id) {
        return orderRepository.findById(id).orElseThrow(() -> new NotFoundException("order", id));
    }

    /** Sequential, human-friendly order numbers: WL-100001, WL-100002, ... */
    private synchronized String nextOrderNumber() {
        if (lastOrderNumber < 0) {
            String max = orderRepository.findMaxOrderNumber();
            lastOrderNumber = max == null ? 100000 : Long.parseLong(max.substring(3));
        }
        lastOrderNumber++;
        return "WL-" + lastOrderNumber;
    }
}
