package com.ecommerce.service;

import com.ecommerce.dto.ProductDto;
import com.ecommerce.model.Product;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.specification.ProductSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Cacheable(value = "products", key = "{#categoryId, #search, #minPrice, #maxPrice, #featured, #pageable.pageNumber, #pageable.pageSize}")
    public Page<ProductDto> getProducts(String categoryId, String search, BigDecimal minPrice, BigDecimal maxPrice, Boolean featured, Pageable pageable) {
        Page<Product> products = productRepository.findAll(
                ProductSpecification.filter(categoryId, search, minPrice, maxPrice, featured, true),
                pageable
        );
        return products.map(this::mapToDto);
    }

    @Cacheable(value = "product", key = "#slug")
    public Optional<ProductDto> getProductBySlug(String slug) {
        return productRepository.findBySlug(slug).map(this::mapToDto);
    }

    private ProductDto mapToDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setSlug(product.getSlug());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setCompareAtPrice(product.getCompareAtPrice());
        dto.setImages(product.getImages());
        dto.setStock(product.getStock());
        dto.setActive(product.isActive());
        dto.setFeatured(product.isFeatured());
        dto.setTaxRate(product.getTaxRate());
        
        if (product.getCategory() != null) {
            dto.setCategoryName(product.getCategory().getName());
            dto.setCategorySlug(product.getCategory().getSlug());
        }
        
        return dto;
    }
}
