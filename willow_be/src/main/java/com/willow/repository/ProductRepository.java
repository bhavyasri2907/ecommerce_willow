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

    List<Product> findByType(ProductType type);

    List<Product> findByStatus(ProductStatus status);

    List<Product> findByTypeAndStatus(ProductType type, ProductStatus status);

    List<Product> findByStatusNot(ProductStatus status);

    long countByStatus(ProductStatus status);

    long countByType(ProductType type);

    long countByStockAndStatusNot(int stock, ProductStatus status);

    long countByStockBetweenAndStatusNot(int min, int max, ProductStatus status);

    long countByTypeAndStatus(ProductType type, ProductStatus status);

    long countByTypeAndStockAndStatusNot(ProductType type, int stock, ProductStatus status);

    long countByTypeAndStockBetweenAndStatusNot(ProductType type, int min, int max, ProductStatus status);

    boolean existsBySkuIgnoreCase(String sku);

    boolean existsBySkuIgnoreCaseAndIdNot(String sku, Long id);

    /** Row lock used whenever stock is changed, so concurrent orders cannot oversell. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Product p where p.id = :id")
    Optional<Product> findByIdForUpdate(@Param("id") Long id);
}
