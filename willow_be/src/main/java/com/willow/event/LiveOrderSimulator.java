package com.willow.event;

import com.willow.dto.request.CreateOrderRequest;
import com.willow.entity.Order;
import com.willow.entity.OrderStatus;
import com.willow.entity.Product;
import com.willow.entity.ProductStatus;
import com.willow.repository.OrderRepository;
import com.willow.repository.ProductRepository;
import com.willow.service.OrderService;
import com.willow.service.StoreService;
import com.willow.util.SampleCustomers;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Development aid, switched on per store from the dashboard's Settings page. While a store
 * has it enabled, every few seconds it places a storefront-style order for that store's
 * products or advances one of its open orders, going through the same OrderService as real
 * traffic, so every dashboard view updates live.
 */
@Component
public class LiveOrderSimulator {

    private static final Logger log = LoggerFactory.getLogger(LiveOrderSimulator.class);

    private final StoreService storeService;
    private final OrderService orderService;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final Random random = new Random();

    public LiveOrderSimulator(StoreService storeService, OrderService orderService,
                              ProductRepository productRepository, OrderRepository orderRepository) {
        this.storeService = storeService;
        this.orderService = orderService;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }

    @Scheduled(initialDelay = 8_000, fixedDelay = 7_000)
    public void tick() {
        for (Long storeId : storeService.storesSimulatingOrders()) {
            try {
                if (random.nextInt(100) < 60) placeOrder(storeId);
                else advanceOrder(storeId);
            } catch (RuntimeException e) {
                log.debug("Simulator skipped a tick for store {}: {}", storeId, e.getMessage());
            }
        }
    }

    private void placeOrder(Long storeId) {
        List<Product> available = new ArrayList<>(productRepository.findByStoreIdAndStatus(storeId, ProductStatus.LIVE)
                .stream().filter(p -> p.getStock() > 0).toList());
        if (available.isEmpty()) return;

        int lines = 1 + (random.nextInt(100) < 35 ? 1 : 0) + (random.nextInt(100) < 10 ? 1 : 0);
        List<CreateOrderRequest.Line> items = new ArrayList<>();
        for (int i = 0; i < lines && !available.isEmpty(); i++) {
            Product p = available.remove(random.nextInt(available.size()));
            List<String> sizes = p.getSizes() == null ? List.of() : List.of(p.getSizes().split(","));
            String size = sizes.isEmpty() ? null : sizes.get(random.nextInt(sizes.size()));
            int qty = p.getStock() > 1 && random.nextInt(100) < 15 ? 2 : 1;
            items.add(new CreateOrderRequest.Line(p.getId(), size, qty));
        }

        SampleCustomers.Customer c = SampleCustomers.random(random);
        orderService.place(new CreateOrderRequest(c.name(), c.email(), c.phone(), c.address(), c.city(),
                SampleCustomers.randomPayment(random), items));
    }

    private void advanceOrder(Long storeId) {
        List<Order> open = orderRepository.findByStoreIdAndStatusIn(storeId,
                List.of(OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PACKED, OrderStatus.SHIPPED));
        if (open.isEmpty()) return;
        Order order = open.get(random.nextInt(open.size()));
        OrderStatus next = order.getStatus().nextStatuses().get(0);
        orderService.updateStatus(storeId, order.getId(), next);
    }
}
