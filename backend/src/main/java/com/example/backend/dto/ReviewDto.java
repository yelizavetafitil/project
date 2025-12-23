package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDto {
    private Long id;
    
    @NotNull
    private Long orderId;
    
    @NotNull
    private Long providerId;
    private String providerName;
    
    @NotNull
    private Long serviceId;
    private String serviceName;
    
    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;
    
    @NotBlank
    private String comment;
    
    private LocalDateTime createdAt;
}
















