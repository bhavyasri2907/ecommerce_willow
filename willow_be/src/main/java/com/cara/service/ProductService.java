package com.cara.service;

import com.cara.dto.ProductDto;
import com.cara.exception.NotFoundException;
import com.cara.model.Product;
import com.cara.model.ProductStatus;
import com.cara.model.ProductType;
import com.cara.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Storefront (public) product reads. Only LIVE products are listed to shoppers. */
@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductDto> findAll(ProductType type) {
        List<Product> products = (type == null)
                ? productRepository.findByStatus(ProductStatus.LIVE)
                : productRepository.findByTypeAndStatus(type, ProductStatus.LIVE);
        return products.stream().map(ProductDto::from).toList();
    }

    @Transactional(readOnly = true)
    public ProductDto findById(Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("product", id));
        return ProductDto.from(p);
    }
}
