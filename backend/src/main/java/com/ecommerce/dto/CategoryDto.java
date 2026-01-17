package com.ecommerce.dto;

import lombok.Data;

@Data
public class CategoryDto {
    private String id;
    private String name;
    private String slug;
    private String description;
    private String image;
    private String parentId;
}
