package com.cara.repository;

import com.cara.model.OrderItem;
import com.cara.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    boolean existsByProductId(Long productId);

    /** Rows of [productId, units, revenue] across all orders not in the excluded statuses. */
    @Query("""
            select i.product.id, sum(i.quantity), sum(i.unitPrice * i.quantity)
            from OrderItem i
            where i.order.status not in :excluded
            group by i.product.id
            """)
    List<Object[]> salesByProduct(@Param("excluded") Collection<OrderStatus> excluded);

    /** Same as salesByProduct, limited to orders placed on or after {@code from}. */
    @Query("""
            select i.product.id, sum(i.quantity), sum(i.unitPrice * i.quantity)
            from OrderItem i
            where i.order.status not in :excluded and i.order.createdAt >= :from
            group by i.product.id
            """)
    List<Object[]> salesByProductSince(@Param("excluded") Collection<OrderStatus> excluded,
                                       @Param("from") Instant from);
}
