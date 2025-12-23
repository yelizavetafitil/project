package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProviderStatsDto {
    private Long totalServices;
    private Long totalOrders;
    private Long pendingOrders;
    private Long confirmedOrders;
    private Long inProgressOrders;
    private Long completedOrders;
    private Long cancelledOrders;
    private BigDecimal totalRevenue;
    private BigDecimal averageOrderValue;
    private Map<String, Long> ordersByStatus;
    private Map<String, Long> ordersByService;
}



