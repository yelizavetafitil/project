package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceDto {
    private Long id;
    
    @NotBlank
    private String name;
    
    private String description;
    
    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal price;
    
    private Integer durationMinutes;
    private String imageUrl;
    
    @NotNull
    private Long categoryId;
    private String categoryName;
    
    private Long providerId;
    private String providerName;
    
    private Boolean active;
    private Double averageRating;
    private Integer reviewCount;
}
















