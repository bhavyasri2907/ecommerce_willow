package com.willow.service;

import com.willow.dto.response.ProductDto;
import com.willow.exception.NotFoundException;
import com.willow.entity.Product;
import com.willow.entity.ProductStatus;
import com.willow.entity.ProductType;
import com.willow.repository.ProductRepository;
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
        // Drafts and archived products are not on sale, so shoppers cannot open them either.
        Product p = productRepository.findById(id)
                .filter(product -> product.getStatus() == ProductStatus.LIVE)
                .orElseThrow(() -> new NotFoundException("product", id));
        return ProductDto.from(p);
    }
}
