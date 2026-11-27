package com.willow.repository;

import com.willow.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AddressRepository extends JpaRepository<Address, Long> {

    /** The default address first, then newest first. */
    @Query("select a from Address a where a.customer.id = :customerId order by a.defaultAddress desc, a.createdAt desc, a.id desc")
    List<Address> findForCustomer(@Param("customerId") Long customerId);

    Optional<Address> findByIdAndCustomerId(Long id, Long customerId);

    long countByCustomerId(Long customerId);

    /** Clears the customer's default flag; flushed straight away so the one-default-per-customer index never sees two. */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("update Address a set a.defaultAddress = false where a.customer.id = :customerId and a.defaultAddress = true")
    void clearDefault(@Param("customerId") Long customerId);
}
