package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDto {
    private Long id;
    
    @NotBlank
    private String name;
    
    private String description;
    private String icon;
    private Long serviceCount;
}
















