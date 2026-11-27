package com.willow.dto.response;

import com.willow.entity.Order;
import com.willow.entity.OrderItem;
import com.willow.entity.OrderStatus;
import com.willow.entity.OrderStatusChange;
import com.willow.entity.Product;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * An order as both the seller dashboard and the shopper's My Orders see it.
 * {@code nextStatuses} are the seller's possible moves; {@code cancellable} says whether
 * the shopper may still cancel it themselves.
 */
public record OrderDto(
        Long id,
        String orderNumber,
        Long storeId,
        String storeName,
        String customerName,
        String customerEmail,
        String customerPhone,
        String shippingAddress,
        String shippingCity,
        String shippingState,
        String shippingPincode,
        String status,
        List<String> nextStatuses,
        boolean cancellable,
        String cancellationNote,
        String paymentMethod,
        String paymentStatus,
        int itemCount,
        BigDecimal subtotal,
        BigDecimal shippingFee,
        BigDecimal total,
        List<Line> items,
        List<HistoryEntry> history,
        Instant createdAt,
        Instant updatedAt
) {
    public record Line(
            Long productId,
            String productName,
            String type,
            String hex,
            String imageUrl,
            String size,
            int quantity,
            BigDecimal unitPrice,
            BigDecimal lineTotal
    ) {
        static Line from(OrderItem i) {
            Product p = i.getProduct();
            return new Line(p.getId(), i.getProductName(), p.getType().name(), p.getHex(), p.getImageUrl(),
                    i.getSize(), i.getQuantity(), i.getUnitPrice(), i.getLineTotal());
        }
    }

    /** One step of the order's tracking timeline. */
    public record HistoryEntry(String status, String actor, String note, Instant at) {
        static HistoryEntry from(OrderStatusChange c) {
            return new HistoryEntry(c.getStatus().name(), c.getActor().name(), c.getNote(), c.getCreatedAt());
        }
    }

    public static OrderDto from(Order o) {
        return new OrderDto(
                o.getId(), o.getOrderNumber(), o.getStore().getId(), o.getStore().getStoreName(),
                o.getCustomerName(), o.getCustomerEmail(), o.getCustomerPhone(),
                o.getShippingAddress(), o.getShippingCity(), o.getShippingState(), o.getShippingPincode(),
                o.getStatus().name(),
                o.getStatus().nextStatuses().stream().map(OrderStatus::name).toList(),
                o.getStatus().isCustomerCancellable(),
                o.getCancellationNote(),
                o.getPaymentMethod().name(), o.getPaymentStatus().name(), o.getItemCount(),
                o.getSubtotal(), o.getShippingFee(), o.getTotal(),
                o.getItems().stream().map(Line::from).toList(),
                o.getHistory().stream().map(HistoryEntry::from).toList(),
                o.getCreatedAt(), o.getUpdatedAt()
        );
    }
}
