package com.example.backend.dto;

import com.example.backend.model.Order;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDto {
    private Long id;
    
    @NotNull
    private Long customerId;
    private String customerName;
    
    @NotNull
    private Long serviceId;
    private String serviceName;
    
    private Long providerId;
    private String providerName;
    
    @NotNull
    private LocalDateTime scheduledDateTime;
    
    private String address;
    private String notes;
    
    private Order.OrderStatus status;
    private BigDecimal totalPrice;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}
















