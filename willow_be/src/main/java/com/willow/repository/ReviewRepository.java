package com.willow.repository;

import com.willow.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    /** One product's reviews, in the order the pageable asks for (product page). */
    @Query(value = "select r from Review r join fetch r.customer where r.product.id = :productId",
            countQuery = "select count(r) from Review r where r.product.id = :productId")
    Page<Review> findForProduct(@Param("productId") Long productId, Pageable pageable);

    Optional<Review> findByProductIdAndCustomerId(Long productId, Long customerId);

    /** A shopper's reviews, most recently written or edited first (My Reviews). */
    @Query("select r from Review r join fetch r.product p join fetch p.store where r.customer.id = :customerId order by r.updatedAt desc, r.id desc")
    List<Review> findForCustomer(@Param("customerId") Long customerId);

    /** Rows of [rating, count] for one product. */
    @Query("select r.rating, count(r) from Review r where r.product.id = :productId group by r.rating")
    List<Object[]> ratingBreakdown(@Param("productId") Long productId);

    /** Rows of [productId, average rating, review count] for the given products. */
    @Query("select r.product.id, avg(r.rating), count(r) from Review r where r.product.id in :productIds group by r.product.id")
    List<Object[]> statsFor(@Param("productIds") Collection<Long> productIds);
}
