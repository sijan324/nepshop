package com.ecommerce.dto;

import lombok.Data;

@Data
public class AddToCartRequest {
    private String productId;
    private String variantId;
    private Integer quantity;
}
