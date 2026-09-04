package com.cara.service;

import com.cara.dto.ProductDto;
import com.cara.model.Product;
import com.cara.model.ProductType;
import com.cara.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<ProductDto> findAll(ProductType type) {
        List<Product> products = (type == null)
                ? productRepository.findAll()
                : productRepository.findByType(type);
        return products.stream().map(ProductDto::from).toList();
    }

    public ProductDto findById(Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new NoSuchProductException(id));
        return ProductDto.from(p);
    }

    public static class NoSuchProductException extends RuntimeException {
        public NoSuchProductException(Long id) {
            super("No product with id " + id);
        }
    }
}
