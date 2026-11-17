package com.willow.repository;

import com.willow.entity.SellerSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface SellerSessionRepository extends JpaRepository<SellerSession, Long> {

    @Query("select s from SellerSession s join fetch s.seller where s.tokenHash = :tokenHash")
    Optional<SellerSession> findByTokenHash(@Param("tokenHash") String tokenHash);

    @Modifying
    @Query("delete from SellerSession s where s.tokenHash = :tokenHash")
    void deleteByTokenHash(@Param("tokenHash") String tokenHash);

    @Modifying
    @Query("delete from SellerSession s where s.expiresAt < :now")
    void deleteExpired(@Param("now") Instant now);
}
