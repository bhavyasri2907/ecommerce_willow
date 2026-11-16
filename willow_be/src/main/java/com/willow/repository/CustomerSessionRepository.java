package com.willow.repository;

import com.willow.entity.CustomerSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface CustomerSessionRepository extends JpaRepository<CustomerSession, Long> {

    @Query("select s from CustomerSession s join fetch s.customer where s.tokenHash = :tokenHash")
    Optional<CustomerSession> findByTokenHash(@Param("tokenHash") String tokenHash);

    @Modifying
    @Query("delete from CustomerSession s where s.tokenHash = :tokenHash")
    void deleteByTokenHash(@Param("tokenHash") String tokenHash);

    @Modifying
    @Query("delete from CustomerSession s where s.expiresAt < :now")
    void deleteExpired(@Param("now") Instant now);
}
