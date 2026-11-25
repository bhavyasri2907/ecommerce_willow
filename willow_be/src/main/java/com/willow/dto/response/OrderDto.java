package com.willow.dto.response;

import com.willow.entity.Order;
import com.willow.entity.OrderItem;
import com.willow.entity.OrderStatus;
import com.willow.entity.Product;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

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
        String status,
        List<String> nextStatuses,
        String paymentMethod,
        int itemCount,
        BigDecimal subtotal,
        BigDecimal shippingFee,
        BigDecimal total,
        List<Line> items,
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

    public static OrderDto from(Order o) {
        return new OrderDto(
                o.getId(), o.getOrderNumber(), o.getStore().getId(), o.getStore().getStoreName(),
                o.getCustomerName(), o.getCustomerEmail(), o.getCustomerPhone(),
                o.getShippingAddress(), o.getShippingCity(), o.getStatus().name(),
                o.getStatus().nextStatuses().stream().map(OrderStatus::name).toList(),
                o.getPaymentMethod().name(), o.getItemCount(),
                o.getSubtotal(), o.getShippingFee(), o.getTotal(),
                o.getItems().stream().map(Line::from).toList(),
                o.getCreatedAt(), o.getUpdatedAt()
        );
    }
}
