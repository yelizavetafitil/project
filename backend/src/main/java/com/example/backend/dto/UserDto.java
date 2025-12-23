package com.example.backend.dto;

import com.example.backend.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String address;
    private String role;
    private String password; // For creating users
    private LocalDateTime createdAt;
    private Boolean active;
}









