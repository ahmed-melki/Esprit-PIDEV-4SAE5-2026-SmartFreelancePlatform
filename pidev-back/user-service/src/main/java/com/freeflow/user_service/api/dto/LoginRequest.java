package com.freeflow.user_service.api.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}