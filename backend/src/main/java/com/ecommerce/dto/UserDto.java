package com.ecommerce.dto;

import lombok.Data;

@Data
public class UserDto {
    private String id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String role;
    private boolean isVerified;
}
