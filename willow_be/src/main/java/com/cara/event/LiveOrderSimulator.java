package com.cara.event;

import com.cara.dto.CreateOrderRequest;
import com.cara.model.CustomerOrder;
import com.cara.model.OrderStatus;
import com.cara.model.Product;
import com.cara.model.ProductStatus;
import com.cara.repository.OrderRepository;
import com.cara.repository.ProductRepository;
import com.cara.seed.SampleCustomers;
import com.cara.service.OrderService;
import com.cara.service.StoreService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Development aid, switched on from the dashboard's Settings page. While enabled it
 * places a storefront-style order or advances an open order every few seconds, going
 * through the same OrderService as real traffic, so every dashboard view updates live.
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
        if (!storeService.settings().isSimulateLiveOrders()) return;
        try {
            if (random.nextInt(100) < 60) placeOrder();
            else advanceOrder();
        } catch (RuntimeException e) {
            log.debug("Simulator skipped a tick: {}", e.getMessage());
        }
    }

    private void placeOrder() {
        List<Product> available = new ArrayList<>(productRepository.findByStatus(ProductStatus.LIVE).stream()
                .filter(p -> p.getStock() > 0).toList());
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

    private void advanceOrder() {
        List<CustomerOrder> open = orderRepository.findByStatusIn(
                List.of(OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PACKED, OrderStatus.SHIPPED));
        if (open.isEmpty()) return;
        CustomerOrder order = open.get(random.nextInt(open.size()));
        OrderStatus next = order.getStatus().nextStatuses().get(0);
        orderService.updateStatus(order.getId(), next);
    }
}
