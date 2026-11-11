package com.cara.repository;

import com.cara.model.CustomerOrder;
import com.cara.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface OrderRepository extends JpaRepository<CustomerOrder, Long>, JpaSpecificationExecutor<CustomerOrder> {

    long countByStatus(OrderStatus status);

    @Query("select max(o.orderNumber) from CustomerOrder o")
    String findMaxOrderNumber();

    /** All orders since the given instant, with items and products fetched in one go for analytics. */
    @Query("""
            select distinct o from CustomerOrder o
            left join fetch o.items i
            left join fetch i.product
            where o.createdAt >= :from
            """)
    List<CustomerOrder> findWithItemsSince(@Param("from") Instant from);

    List<CustomerOrder> findByStatusIn(List<OrderStatus> statuses);
}
