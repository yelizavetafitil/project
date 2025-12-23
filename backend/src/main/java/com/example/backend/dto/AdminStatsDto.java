package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsDto {
    private Long totalUsers;
    private Long totalCustomers;
    private Long totalProviders;
    private Long totalServices;
    private Long totalOrders;
    private Long pendingOrders;
    private Long completedOrders;
    private Long cancelledOrders;
    private BigDecimal totalRevenue;
    private Map<String, Long> ordersByStatus;
    private Map<String, Long> usersByRole;
}








