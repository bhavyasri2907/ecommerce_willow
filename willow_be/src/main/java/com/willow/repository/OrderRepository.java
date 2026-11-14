package com.willow.repository;

import com.willow.entity.Order;
import com.willow.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    long countByStatus(OrderStatus status);

    @Query("select max(o.orderNumber) from Order o")
    String findMaxOrderNumber();

    /** All orders since the given instant, with items and products fetched in one go for analytics. */
    @Query("""
            select distinct o from Order o
            left join fetch o.items i
            left join fetch i.product
            where o.createdAt >= :from
            """)
    List<Order> findWithItemsSince(@Param("from") Instant from);

    List<Order> findByStatusIn(List<OrderStatus> statuses);
}
