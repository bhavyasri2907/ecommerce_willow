package com.willow.repository;

import com.willow.entity.CuratedPick;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CuratedPickRepository extends JpaRepository<CuratedPick, Long> {

    /** A product's fit, in the seller's order. */
    @EntityGraph(attributePaths = "pick")
    List<CuratedPick> findByProductIdOrderByPositionAscIdAsc(Long productId);

    /** Every fit in a store, for the dashboard's Curated Picks page. */
    @EntityGraph(attributePaths = "pick")
    List<CuratedPick> findByProductStoreIdOrderByPositionAscIdAsc(Long storeId);

    Optional<CuratedPick> findByProductIdAndPickId(Long productId, Long pickId);

    long countByProductId(Long productId);

    /** Run before deleting a product: removes its own fit and takes it out of everyone else's. */
    @Modifying
    @Query("delete from CuratedPick c where c.product.id = :productId or c.pick.id = :productId")
    void deleteAllInvolving(@Param("productId") Long productId);
}
