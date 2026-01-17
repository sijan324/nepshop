package com.ecommerce.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductDto {
    private String id;
    private String name;
    private String slug;
    private String description;
    private BigDecimal price;
    private BigDecimal compareAtPrice;
    private String categoryName;
    private String categorySlug;
    private List<String> images;
    private Integer stock;
    private boolean isActive;
    private boolean isFeatured;
    private BigDecimal taxRate;
}
