package com.willow.repository;

import com.willow.entity.Product;
import com.willow.entity.ProductStatus;
import com.willow.entity.ProductType;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    // Storefront: every store's products.
    List<Product> findByStatus(ProductStatus status);
    List<Product> findByTypeAndStatus(ProductType type, ProductStatus status);

    // Seller dashboard: one store's products.
    List<Product> findByStoreIdAndStatus(Long storeId, ProductStatus status);
    List<Product> findByStoreIdAndStatusNot(Long storeId, ProductStatus status);
    Optional<Product> findByIdAndStoreId(Long id, Long storeId);

    boolean existsByStoreIdAndSkuIgnoreCase(Long storeId, String sku);
    boolean existsByStoreIdAndSkuIgnoreCaseAndIdNot(Long storeId, String sku, Long id);

    /** Row lock used whenever stock is changed, so concurrent orders cannot oversell. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Product p where p.id = :id")
    Optional<Product> findByIdForUpdate(@Param("id") Long id);
}
