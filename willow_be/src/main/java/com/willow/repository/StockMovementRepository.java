package com.willow.repository;

import com.willow.entity.StockMovement;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    @EntityGraph(attributePaths = "product")
    List<StockMovement> findAllByOrderByCreatedAtDescIdDesc(Pageable pageable);

    @EntityGraph(attributePaths = "product")
    List<StockMovement> findByProductIdOrderByCreatedAtDescIdDesc(Long productId, Pageable pageable);

    @Modifying
    @Query("delete from StockMovement m where m.product.id = :productId")
    void deleteByProductId(@Param("productId") Long productId);
}
