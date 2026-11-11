package com.cara.repository;

import com.cara.model.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {
    List<Recommendation> findByTopId(Long topId);
    Optional<Recommendation> findByTopIdAndPantsId(Long topId, Long pantsId);
    void deleteByTopIdAndPantsId(Long topId, Long pantsId);

    @Modifying
    @Query("delete from Recommendation r where r.top.id = :productId or r.pants.id = :productId")
    void deleteAllInvolving(@Param("productId") Long productId);
}
