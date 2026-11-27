package com.willow.repository;

import com.willow.entity.Order;
import com.willow.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    Optional<Order> findByIdAndStoreId(Long id, Long storeId);

    long countByStoreId(Long storeId);

    long countByStoreIdAndStatus(Long storeId, OrderStatus status);

    List<Order> findByStoreIdAndStatusIn(Long storeId, List<OrderStatus> statuses);

    /** Next number from the marketplace-wide order number sequence (08_checkout.sql). */
    @Query(value = "select nextval('order_number_seq')", nativeQuery = true)
    long nextOrderNumber();

    /** A shopper's orders, newest first (My Orders). */
    Page<Order> findByCustomerId(Long customerId, Pageable pageable);

    Optional<Order> findByCustomerIdAndOrderNumber(Long customerId, String orderNumber);

    /** Orders an earlier attempt of the same checkout already created. */
    List<Order> findByCustomerIdAndCheckoutRefOrderByIdAsc(Long customerId, String checkoutRef);

    /** One store's orders since the given instant, with items and products fetched in one go for analytics. */
    @Query("""
            select distinct o from Order o
            left join fetch o.items i
            left join fetch i.product
            where o.store.id = :storeId and o.createdAt >= :from
            """)
    List<Order> findWithItemsSince(@Param("storeId") Long storeId, @Param("from") Instant from);
}
