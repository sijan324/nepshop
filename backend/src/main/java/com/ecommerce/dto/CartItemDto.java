package com.ecommerce.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CartItemDto {
    private String id;
    private String productId;
    private String productName;
    private String productImage;
    private String variantId;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal total;
}
