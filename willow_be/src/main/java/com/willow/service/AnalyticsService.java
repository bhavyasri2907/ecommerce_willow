package com.willow.service;

import com.willow.dto.response.AnalyticsDto;
import com.willow.dto.response.AnalyticsDto.*;
import com.willow.entity.*;
import com.willow.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Sales reporting for one store. Revenue, units and customers only count orders that were not
 * cancelled or returned; status and payment breakdowns count every order.
 */
@Service
public class AnalyticsService {

    private final OrderRepository orderRepository;
    private final ZoneId zone;

    public AnalyticsService(OrderRepository orderRepository,
                            @Value("${willow.timezone:Asia/Kolkata}") String timezone) {
        this.orderRepository = orderRepository;
        this.zone = ZoneId.of(timezone);
    }

    @Transactional(readOnly = true)
    public AnalyticsDto report(Long storeId, int rangeDays) {
        int days = Math.max(1, Math.min(rangeDays, 365));
        LocalDate today = LocalDate.now(zone);
        LocalDate from = today.minusDays(days - 1L);
        Instant currentStart = from.atStartOfDay(zone).toInstant();
        Instant previousStart = from.minusDays(days).atStartOfDay(zone).toInstant();

        List<Order> all = orderRepository.findWithItemsSince(storeId, previousStart);
        List<Order> current = all.stream().filter(o -> !o.getCreatedAt().isBefore(currentStart)).toList();
        List<Order> previous = all.stream().filter(o -> o.getCreatedAt().isBefore(currentStart)).toList();
        List<Order> currentValid = current.stream().filter(o -> !o.getStatus().isVoid()).toList();
        List<Order> previousValid = previous.stream().filter(o -> !o.getStatus().isVoid()).toList();

        Kpis kpis = new Kpis(
                kpi(revenue(currentValid), revenue(previousValid)),
                kpi(BigDecimal.valueOf(currentValid.size()), BigDecimal.valueOf(previousValid.size())),
                kpi(aov(currentValid), aov(previousValid)),
                kpi(BigDecimal.valueOf(units(currentValid)), BigDecimal.valueOf(units(previousValid))),
                kpi(BigDecimal.valueOf(customers(currentValid)), BigDecimal.valueOf(customers(previousValid))));

        return new AnalyticsDto(days, from, today, kpis,
                dailySeries(currentValid, from, today),
                byCategory(currentValid),
                countBy(current, o -> o.getStatus().name(), OrderStatus.values()),
                countBy(current, o -> o.getPaymentMethod().name(), PaymentMethod.values()),
                topProducts(currentValid),
                topCities(currentValid));
    }

    private List<DailyPoint> dailySeries(List<Order> orders, LocalDate from, LocalDate to) {
        Map<LocalDate, List<Order>> byDay = orders.stream()
                .collect(Collectors.groupingBy(o -> LocalDate.ofInstant(o.getCreatedAt(), zone)));
        List<DailyPoint> series = new ArrayList<>();
        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            List<Order> dayOrders = byDay.getOrDefault(d, List.of());
            series.add(new DailyPoint(d, revenue(dayOrders), dayOrders.size(), units(dayOrders)));
        }
        return series;
    }

    private static List<CategoryStat> byCategory(List<Order> orders) {
        Map<ProductType, BigDecimal> revenue = new EnumMap<>(ProductType.class);
        Map<ProductType, Long> units = new EnumMap<>(ProductType.class);
        for (Order o : orders) {
            for (OrderItem i : o.getItems()) {
                ProductType t = i.getProduct().getType();
                revenue.merge(t, i.getLineTotal(), BigDecimal::add);
                units.merge(t, (long) i.getQuantity(), Long::sum);
            }
        }
        return Arrays.stream(ProductType.values())
                .map(t -> new CategoryStat(t.name(), t.getLabel(),
                        revenue.getOrDefault(t, BigDecimal.ZERO), units.getOrDefault(t, 0L)))
                .sorted(Comparator.comparing(CategoryStat::revenue).reversed())
                .toList();
    }

    private static List<TopProduct> topProducts(List<Order> orders) {
        Map<Long, Product> products = new HashMap<>();
        Map<Long, BigDecimal> revenue = new HashMap<>();
        Map<Long, Long> units = new HashMap<>();
        for (Order o : orders) {
            for (OrderItem i : o.getItems()) {
                Product p = i.getProduct();
                products.putIfAbsent(p.getId(), p);
                revenue.merge(p.getId(), i.getLineTotal(), BigDecimal::add);
                units.merge(p.getId(), (long) i.getQuantity(), Long::sum);
            }
        }
        return revenue.entrySet().stream()
                .sorted(Map.Entry.<Long, BigDecimal>comparingByValue().reversed())
                .limit(5)
                .map(e -> {
                    Product p = products.get(e.getKey());
                    return new TopProduct(p.getId(), p.getName(), p.getType().getLabel(), p.getHex(),
                            p.getImageUrl(), units.get(p.getId()), e.getValue());
                })
                .toList();
    }

    private static List<CityStat> topCities(List<Order> orders) {
        Map<String, List<Order>> byCity = orders.stream()
                .filter(o -> o.getShippingCity() != null && !o.getShippingCity().isBlank())
                .collect(Collectors.groupingBy(Order::getShippingCity));
        return byCity.entrySet().stream()
                .map(e -> new CityStat(e.getKey(), e.getValue().size(), revenue(e.getValue())))
                .sorted(Comparator.comparing(CityStat::revenue).reversed())
                .limit(6)
                .toList();
    }

    private static <E extends Enum<E>> Map<String, Long> countBy(List<Order> orders,
                                                                 java.util.function.Function<Order, String> key,
                                                                 E[] values) {
        Map<String, Long> counts = new LinkedHashMap<>();
        for (E v : values) counts.put(v.name(), 0L);
        orders.forEach(o -> counts.merge(key.apply(o), 1L, Long::sum));
        return counts;
    }

    private static Kpi kpi(BigDecimal value, BigDecimal previous) {
        return new Kpi(value, previous);
    }

    private static BigDecimal revenue(List<Order> orders) {
        return orders.stream().map(Order::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private static BigDecimal aov(List<Order> orders) {
        return orders.isEmpty() ? BigDecimal.ZERO
                : revenue(orders).divide(BigDecimal.valueOf(orders.size()), 2, RoundingMode.HALF_UP);
    }

    private static long units(List<Order> orders) {
        return orders.stream().mapToLong(Order::getItemCount).sum();
    }

    private static long customers(List<Order> orders) {
        return orders.stream().map(Order::getCustomerEmail).distinct().count();
    }
}
