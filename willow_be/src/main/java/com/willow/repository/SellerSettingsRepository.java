package com.willow.repository;

import com.willow.entity.SellerSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/** Settings are keyed by store id. */
public interface SellerSettingsRepository extends JpaRepository<SellerSettings, Long> {

    /** Stores that have the developer order simulator switched on. */
    List<SellerSettings> findBySimulateLiveOrdersTrue();
}
