package com.cara.seed;

import com.cara.model.*;
import com.cara.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

/**
 * Seeds the store profile, settings and ~90 days of order history on an empty
 * database, so the dashboard has meaningful numbers on first run. Products come
 * from data.sql. Uses a fixed random seed: every fresh start looks the same.
 * Historical orders do not deduct stock; data.sql holds the current stock levels.
 */
@Component
public class DataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private static final int HISTORY_DAYS = 90;
    private static final ZoneId ZONE = ZoneId.of("Asia/Kolkata");

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final StockMovementRepository movementRepository;
    private final StoreProfileRepository profileRepository;
    private final SellerSettingsRepository settingsRepository;

    public DataSeeder(ProductRepository productRepository, OrderRepository orderRepository,
                      StockMovementRepository movementRepository, StoreProfileRepository profileRepository,
                      SellerSettingsRepository settingsRepository) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.movementRepository = movementRepository;
        this.profileRepository = profileRepository;
        this.settingsRepository = settingsRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedStoreProfile();
        SellerSettings settings = settingsRepository.findById(SellerSettings.SINGLETON_ID)
                .orElseGet(() -> settingsRepository.save(new SellerSettings()));

        List<Product> products = productRepository.findAll();
        if (products.isEmpty() || orderRepository.count() > 0) return;

        Random r = new Random(2026);
        seedStockLedger(products, r);
        int orders = seedOrders(products, settings, r);
        log.info("Seeded {} historical orders across {} products", orders, products.size());
    }

    private void seedStoreProfile() {
        if (profileRepository.existsById(StoreProfile.SINGLETON_ID)) return;
        StoreProfile s = new StoreProfile();
        s.setStoreName("Willow");
        s.setTagline("Dress in pairs");
        s.setDescription("Willow curates tops, bottoms and finishing pieces that are designed to be worn together. "
                + "Every pairing on the storefront is hand-approved by our stylists.");
        s.setOwnerName("Willow Studio");
        s.setContactEmail("seller@willow.example");
        s.setContactPhone("+91 80 4000 2026");
        s.setAddressLine("12, Indiranagar 100 Feet Road");
        s.setCity("Bengaluru");
        s.setState("Karnataka");
        s.setPincode("560038");
        s.setGstin("29ABCDE1234F1Z5");
        s.setInstagram("@willow.studio");
        profileRepository.save(s);
    }

    private void seedStockLedger(List<Product> products, Random r) {
        for (Product p : products) {
            if (p.getStock() == 0) continue;
            StockMovement opening = new StockMovement(p, p.getStock(), StockMovementReason.INITIAL, "Opening stock");
            opening.setCreatedAt(p.getCreatedAt());
            movementRepository.save(opening);
        }
        // A few recent restocks so the movement feed has history.
        List<Product> shuffled = new ArrayList<>(products);
        Collections.shuffle(shuffled, r);
        for (int i = 0; i < Math.min(5, shuffled.size()); i++) {
            Product p = shuffled.get(i);
            if (p.getStatus() == ProductStatus.ARCHIVED || p.getStock() == 0) continue;
            int qty = 10 + r.nextInt(30);
            StockMovement restock = new StockMovement(p, qty, StockMovementReason.RESTOCK, "Supplier delivery");
            restock.setCreatedAt(Instant.now().minus(Duration.ofHours(6 + r.nextInt(24 * 6))));
            movementRepository.save(restock);
        }
    }

    private int seedOrders(List<Product> products, SellerSettings settings, Random r) {
        List<Product> sellable = products.stream().filter(p -> p.getStatus() != ProductStatus.DRAFT).toList();
        Instant now = Instant.now();
        LocalDate today = LocalDate.now(ZONE);
        List<CustomerOrder> orders = new ArrayList<>();

        for (int daysAgo = HISTORY_DAYS - 1; daysAgo >= 0; daysAgo--) {
            LocalDate day = today.minusDays(daysAgo);
            boolean weekend = day.getDayOfWeek().getValue() >= 6;
            // Gentle growth over the quarter, a weekend bump and some day-to-day noise.
            int base = 2 + (HISTORY_DAYS - daysAgo) / 30 + (weekend ? 1 : 0);
            int count = Math.max(0, base + r.nextInt(3) - 1);

            for (int n = 0; n < count; n++) {
                Instant created = day.atStartOfDay(ZONE).toInstant()
                        .plus(Duration.ofMinutes(8 * 60 + r.nextInt(15 * 60)));
                if (created.isAfter(now)) continue;
                final int age = daysAgo;
                List<Product> pool = sellable.stream()
                        .filter(p -> p.getStatus() != ProductStatus.ARCHIVED || age > 30)
                        .toList();
                orders.add(buildOrder(pool, created, now, settings, r));
            }
        }

        orders.sort(Comparator.comparing(CustomerOrder::getCreatedAt));
        long number = 100000;
        for (CustomerOrder o : orders) {
            o.setOrderNumber("WL-" + (++number));
        }
        orderRepository.saveAll(orders);
        return orders.size();
    }

    private CustomerOrder buildOrder(List<Product> pool, Instant created, Instant now,
                                     SellerSettings settings, Random r) {
        SampleCustomers.Customer c = SampleCustomers.random(r);
        CustomerOrder o = new CustomerOrder();
        o.setCustomerName(c.name());
        o.setCustomerEmail(c.email());
        o.setCustomerPhone(c.phone());
        o.setShippingAddress(c.address());
        o.setShippingCity(c.city());
        o.setPaymentMethod(SampleCustomers.randomPayment(r));

        int lines = 1 + (r.nextInt(100) < 35 ? 1 : 0) + (r.nextInt(100) < 10 ? 1 : 0);
        List<Product> candidates = new ArrayList<>(pool);
        for (int i = 0; i < lines && !candidates.isEmpty(); i++) {
            Product p = candidates.remove(r.nextInt(candidates.size()));
            List<String> sizes = p.getSizes() == null ? List.of() : List.of(p.getSizes().split(","));
            String size = sizes.isEmpty() ? null : sizes.get(r.nextInt(sizes.size()));
            o.addItem(new OrderItem(p, size, r.nextInt(100) < 12 ? 2 : 1));
        }

        BigDecimal subtotal = o.getItems().stream().map(OrderItem::getLineTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal shipping = subtotal.compareTo(settings.getFreeShippingThreshold()) >= 0
                ? BigDecimal.ZERO : settings.getShippingFee();
        o.setSubtotal(subtotal);
        o.setShippingFee(shipping);
        o.setTotal(subtotal.add(shipping));

        long ageHours = Duration.between(created, now).toHours();
        o.setStatus(statusForAge(ageHours, r));
        o.setCreatedAt(created);
        Instant updated = created.plus(Duration.ofHours(Math.min(ageHours, 2 + r.nextInt(72))));
        o.setUpdatedAt(updated.isAfter(now) ? now : updated);
        return o;
    }

    /** Older orders have progressed further through fulfilment. */
    private static OrderStatus statusForAge(long ageHours, Random r) {
        int roll = r.nextInt(100);
        if (ageHours < 6) return roll < 70 ? OrderStatus.PENDING : OrderStatus.CONFIRMED;
        if (ageHours < 24) return roll < 30 ? OrderStatus.PENDING : roll < 80 ? OrderStatus.CONFIRMED : OrderStatus.PACKED;
        if (ageHours < 48) return roll < 4 ? OrderStatus.CANCELLED : roll < 30 ? OrderStatus.CONFIRMED
                : roll < 65 ? OrderStatus.PACKED : OrderStatus.SHIPPED;
        if (ageHours < 120) return roll < 5 ? OrderStatus.CANCELLED : roll < 15 ? OrderStatus.PACKED
                : roll < 65 ? OrderStatus.SHIPPED : OrderStatus.DELIVERED;
        return roll < 8 ? OrderStatus.CANCELLED : roll < 13 ? OrderStatus.RETURNED : OrderStatus.DELIVERED;
    }
}
