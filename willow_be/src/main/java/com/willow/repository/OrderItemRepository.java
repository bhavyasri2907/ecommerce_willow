package com.willow.repository;

import com.willow.entity.OrderItem;
import com.willow.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    boolean existsByProductId(Long productId);

    /** Whether the shopper has an order in {@code status} that contains the product (reviews need a delivered one). */
    @Query("""
            select count(i) > 0 from OrderItem i
            where i.order.customer.id = :customerId and i.product.id = :productId and i.order.status = :status
            """)
    boolean customerHasProductInStatus(@Param("customerId") Long customerId,
                                       @Param("productId") Long productId,
                                       @Param("status") OrderStatus status);

    /**
     * Rows of [productId, last update of the order] for products the shopper has in an order in {@code status}
     * but has not reviewed yet, most recent first.
     */
    @Query("""
            select i.product.id, max(i.order.updatedAt) from OrderItem i
            where i.order.customer.id = :customerId and i.order.status = :status
              and not exists (select r.id from Review r where r.product.id = i.product.id and r.customer.id = :customerId)
            group by i.product.id
            order by max(i.order.updatedAt) desc
            """)
    List<Object[]> unreviewedProducts(@Param("customerId") Long customerId, @Param("status") OrderStatus status);

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
