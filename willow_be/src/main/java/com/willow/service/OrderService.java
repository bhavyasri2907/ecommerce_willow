package com.willow.service;

import com.willow.dto.request.CheckoutRequest;
import com.willow.dto.request.OrderLine;
import com.willow.dto.response.OrderDto;
import com.willow.dto.response.PageResponse;
import com.willow.entity.*;
import com.willow.event.LiveEvent;
import com.willow.event.LiveEventPublisher;
import com.willow.exception.NotFoundException;
import com.willow.repository.CustomerRepository;
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
 * Orders end to end: checkout and My Orders on the storefront, fulfilment on the seller dashboard.
 *
 * Each order belongs to one store; a bag drawing from several stores becomes one order per store.
 * Seller-side methods take the seller's store id and customer-side methods the shopper's id, and
 * each only ever sees its own orders. Every status change goes through {@link #transition}, which
 * records history, keeps stock and payment status in step and tells the store's dashboard.
 */
@Service
public class OrderService {

    private static final Set<String> SORTABLE = Set.of("createdAt", "total", "orderNumber");

    /** Payment methods checkout accepts today. Prepaid methods arrive with a payment gateway. */
    private static final Set<PaymentMethod> ACCEPTED_PAYMENTS = EnumSet.of(PaymentMethod.COD);

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final AddressService addressService;
    private final InventoryService inventoryService;
    private final StoreService storeService;
    private final LiveEventPublisher events;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        CustomerRepository customerRepository,
                        AddressService addressService,
                        InventoryService inventoryService,
                        StoreService storeService,
                        LiveEventPublisher events) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.addressService = addressService;
        this.inventoryService = inventoryService;
        this.storeService = storeService;
        this.events = events;
    }

    // ------------------------------------------------------------------------------------------
    // Storefront
    // ------------------------------------------------------------------------------------------

    /**
     * A signed-in shopper's checkout. Ships to one of their saved addresses. Sending the same
     * {@code checkoutRef} again returns the orders the first attempt created.
     */
    @Transactional
    public List<OrderDto> checkout(Long customerId, CheckoutRequest req) {
        List<Order> previous = orderRepository.findByCustomerIdAndCheckoutRefOrderByIdAsc(customerId, req.checkoutRef());
        if (!previous.isEmpty()) return previous.stream().map(OrderDto::from).toList();

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new NotFoundException("customer", customerId));
        Address address = addressService.find(customerId, req.addressId());
        PaymentMethod payment = req.paymentMethod() == null ? PaymentMethod.COD : req.paymentMethod();

        return place(new PlaceOrder(customer, req.checkoutRef(),
                address.getFullName(), customer.getEmail(), address.getPhone(),
                address.getAddressLine(), address.getCity(), address.getState(), address.getPincode(),
                payment, req.items()));
    }

    /** The shopper's orders, newest first. */
    @Transactional(readOnly = true)
    public PageResponse<OrderDto> customerOrders(Long customerId, int page, int size) {
        Page<Order> result = orderRepository.findByCustomerId(customerId,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id"))));
        return PageResponse.of(result, OrderDto::from);
    }

    @Transactional(readOnly = true)
    public OrderDto customerOrder(Long customerId, String orderNumber) {
        return OrderDto.from(findForCustomer(customerId, orderNumber));
    }

    /** The shopper cancels their own order. Allowed until the seller packs it. */
    @Transactional
    public OrderDto cancelByCustomer(Long customerId, String orderNumber, String reason) {
        Order order = findForCustomer(customerId, orderNumber);
        if (order.getStatus() == OrderStatus.CANCELLED) return OrderDto.from(order);
        if (!order.getStatus().isCustomerCancellable()) {
            throw new IllegalStateException("This order has already been " + order.getStatus().name().toLowerCase()
                    + " and can no longer be cancelled.");
        }
        String note = reason == null || reason.isBlank() ? null : reason.trim();
        return transition(order, OrderStatus.CANCELLED, OrderActor.CUSTOMER, note);
    }

    /**
     * Places a bag as one order per store it draws from. Each product is locked (in id order,
     * to avoid deadlocks), checked to be live, in stock and offered in the chosen size, and its
     * stock is taken; each order is priced with its own store's shipping rules. Either every
     * order is created or, if anything is unavailable, none are.
     */
    @Transactional
    public List<OrderDto> place(PlaceOrder cmd) {
        if (!ACCEPTED_PAYMENTS.contains(cmd.paymentMethod())) {
            throw new IllegalArgumentException("Only Cash on Delivery is available right now");
        }

        // The same product and size twice in one request counts as one line.
        Map<String, OrderLine> merged = new LinkedHashMap<>();
        for (OrderLine line : cmd.items()) {
            String size = line.size() == null || line.size().isBlank() ? null : line.size().trim();
            merged.merge(line.productId() + "|" + size, new OrderLine(line.productId(), size, line.quantity()),
                    (a, b) -> new OrderLine(a.productId(), a.size(), a.quantity() + b.quantity()));
        }
        List<OrderLine> lines = new ArrayList<>(merged.values());
        lines.sort(Comparator.comparing(OrderLine::productId));

        // Lock and check everything first, grouping the lines by the store that sells them.
        Map<Long, List<OrderLine>> linesByStore = new LinkedHashMap<>();
        Map<Long, Product> products = new HashMap<>();
        for (OrderLine line : lines) {
            Product p = products.get(line.productId());
            if (p == null) {
                p = productRepository.findByIdForUpdate(line.productId())
                        .orElseThrow(() -> new NotFoundException("product", line.productId()));
                if (p.getStatus() != ProductStatus.LIVE) {
                    throw new IllegalStateException("\"" + p.getName() + "\" is no longer available");
                }
                products.put(p.getId(), p);
            }
            checkSize(p, line.size());
            linesByStore.computeIfAbsent(p.getStore().getId(), id -> new ArrayList<>()).add(line);
        }

        List<OrderDto> placed = new ArrayList<>();
        linesByStore.forEach((storeId, storeLines) -> placed.add(placeForStore(storeId, storeLines, products, cmd)));
        return placed;
    }

    private OrderDto placeForStore(Long storeId, List<OrderLine> lines, Map<Long, Product> products, PlaceOrder cmd) {
        SellerSettings settings = storeService.settings(storeId);

        Order order = new Order();
        order.setStore(storeService.store(storeId));
        order.setCustomer(cmd.customer());
        order.setCheckoutRef(cmd.checkoutRef());
        order.setOrderNumber("WL-" + orderRepository.nextOrderNumber());
        order.setCustomerName(cmd.name().trim());
        order.setCustomerEmail(cmd.email().trim().toLowerCase(Locale.ROOT));
        order.setCustomerPhone(cmd.phone());
        order.setShippingAddress(cmd.addressLine());
        order.setShippingCity(cmd.city());
        order.setShippingState(cmd.state());
        order.setShippingPincode(cmd.pincode());
        order.setPaymentMethod(cmd.paymentMethod());
        order.setPaymentStatus(PaymentStatus.PENDING);
        order.moveTo(OrderStatus.PENDING, cmd.customer() == null ? OrderActor.SYSTEM : OrderActor.CUSTOMER, null);
        if (settings.isAutoConfirmOrders()) {
            order.moveTo(OrderStatus.CONFIRMED, OrderActor.SYSTEM, "Confirmed automatically");
        }

        Set<Long> touched = new LinkedHashSet<>();
        for (OrderLine line : lines) {
            Product p = products.get(line.productId());
            if (p.getStock() < line.quantity()) {
                throw new IllegalStateException(p.getStock() == 0
                        ? "\"" + p.getName() + "\" just sold out"
                        : "Only " + p.getStock() + " of \"" + p.getName() + "\" left. Lower the quantity and try again.");
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

    /** A product sold in sizes needs one of them picked; a one-size product takes none. */
    private static void checkSize(Product p, String size) {
        List<String> sizes = p.getSizes() == null || p.getSizes().isBlank() ? List.of()
                : Arrays.stream(p.getSizes().split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
        if (sizes.isEmpty()) return;
        if (size == null) throw new IllegalArgumentException("Pick a size for \"" + p.getName() + "\"");
        if (!sizes.contains(size)) {
            throw new IllegalArgumentException("\"" + p.getName() + "\" is not available in size " + size);
        }
    }

    // ------------------------------------------------------------------------------------------
    // Seller dashboard
    // ------------------------------------------------------------------------------------------

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
                        cb.like(cb.lower(root.get("customerPhone")), like),
                        cb.like(cb.lower(root.get("shippingCity")), like),
                        cb.like(cb.lower(root.get("shippingPincode")), like)));
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
        return OrderDto.from(findForStore(storeId, id));
    }

    /** The seller moves one of their orders along its workflow. */
    @Transactional
    public OrderDto updateStatus(Long storeId, Long id, OrderStatus target, String note) {
        Order order = findForStore(storeId, id);
        if (order.getStatus() == target) return OrderDto.from(order);
        if (!order.getStatus().canMoveTo(target)) {
            throw new IllegalStateException("Cannot move order " + order.getOrderNumber()
                    + " from " + order.getStatus() + " to " + target);
        }
        return transition(order, target, OrderActor.SELLER, note == null || note.isBlank() ? null : note.trim());
    }

    // ------------------------------------------------------------------------------------------
    // Shared
    // ------------------------------------------------------------------------------------------

    /**
     * Applies a status change: cancelling or returning puts the stock back, delivery collects
     * Cash on Delivery money, and the store's dashboard is told about it.
     */
    private OrderDto transition(Order order, OrderStatus target, OrderActor actor, String note) {
        Long storeId = order.getStore().getId();

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

        order.setPaymentStatus(paymentStatusAfter(order, target));
        order.moveTo(target, actor, note);
        OrderDto dto = OrderDto.from(orderRepository.saveAndFlush(order));
        events.publish(storeId, LiveEvent.ORDER_UPDATED, dto);
        if (actor == OrderActor.CUSTOMER && target == OrderStatus.CANCELLED) {
            events.publish(storeId, LiveEvent.ORDER_CANCELLED_BY_CUSTOMER, dto);
        }
        return dto;
    }

    private static PaymentStatus paymentStatusAfter(Order order, OrderStatus target) {
        PaymentStatus current = order.getPaymentStatus();
        return switch (target) {
            // Cash on Delivery is collected by the courier on delivery.
            case DELIVERED -> order.getPaymentMethod() == PaymentMethod.COD ? PaymentStatus.PAID : current;
            case CANCELLED -> current == PaymentStatus.PAID ? PaymentStatus.REFUNDED : PaymentStatus.VOID;
            case RETURNED -> current == PaymentStatus.PAID ? PaymentStatus.REFUNDED : PaymentStatus.VOID;
            default -> current;
        };
    }

    /** The store's own order, or 404 - an order of another store looks exactly like a missing one. */
    private Order findForStore(Long storeId, Long id) {
        return orderRepository.findByIdAndStoreId(id, storeId).orElseThrow(() -> new NotFoundException("order", id));
    }

    /** The shopper's own order, or 404. */
    private Order findForCustomer(Long customerId, String orderNumber) {
        return orderRepository.findByCustomerIdAndOrderNumber(customerId, orderNumber)
                .orElseThrow(() -> new NotFoundException("order", orderNumber));
    }
}
