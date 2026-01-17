package com.ecommerce.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CartDto {
    private String id;
    private String userId;
    private String sessionId;
    private List<CartItemDto> items;
    private BigDecimal total;
}
