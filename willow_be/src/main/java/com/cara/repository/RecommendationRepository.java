package com.cara.repository;

import com.cara.model.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {
    List<Recommendation> findByTopId(Long topId);
    Optional<Recommendation> findByTopIdAndPantsId(Long topId, Long pantsId);
    void deleteByTopIdAndPantsId(Long topId, Long pantsId);
}
