package com.example.backend.service;

import com.example.backend.dto.ProviderStatsDto;
import com.example.backend.model.Order;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProviderStatsService {

    private final ServiceRepository serviceRepository;
    private final OrderRepository orderRepository;

    public ProviderStatsDto getProviderStats(Long providerId) {
        ProviderStatsDto stats = new ProviderStatsDto();

      
        long totalServices = serviceRepository.findByProviderId(providerId).size();
        stats.setTotalServices(totalServices);

     
        List<Order> orders = orderRepository.findByProviderId(providerId);
        long totalOrders = orders.size();
        stats.setTotalOrders(totalOrders);

        long pendingOrders = orders.stream()
                .filter(o -> o.getStatus() == Order.OrderStatus.PENDING)
                .count();
        stats.setPendingOrders(pendingOrders);

        long confirmedOrders = orders.stream()
                .filter(o -> o.getStatus() == Order.OrderStatus.CONFIRMED)
                .count();
        stats.setConfirmedOrders(confirmedOrders);

        long inProgressOrders = orders.stream()
                .filter(o -> o.getStatus() == Order.OrderStatus.IN_PROGRESS)
                .count();
        stats.setInProgressOrders(inProgressOrders);

        long completedOrders = orders.stream()
                .filter(o -> o.getStatus() == Order.OrderStatus.COMPLETED)
                .count();
        stats.setCompletedOrders(completedOrders);

        long cancelledOrders = orders.stream()
                .filter(o -> o.getStatus() == Order.OrderStatus.CANCELLED)
                .count();
        stats.setCancelledOrders(cancelledOrders);

 
        BigDecimal totalRevenue = orders.stream()
                .filter(o -> o.getStatus() == Order.OrderStatus.COMPLETED)
                .map(Order::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.setTotalRevenue(totalRevenue);

      
        BigDecimal averageOrderValue = completedOrders > 0
                ? totalRevenue.divide(BigDecimal.valueOf(completedOrders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        stats.setAverageOrderValue(averageOrderValue);


        Map<String, Long> ordersByStatus = new HashMap<>();
        for (Order.OrderStatus status : Order.OrderStatus.values()) {
            long count = orders.stream()
                    .filter(o -> o.getStatus() == status)
                    .count();
            ordersByStatus.put(status.name(), count);
        }
        stats.setOrdersByStatus(ordersByStatus);

     
        Map<String, Long> ordersByService = orders.stream()
                .filter(o -> o.getStatus() == Order.OrderStatus.COMPLETED)
                .collect(Collectors.groupingBy(
                        o -> o.getService().getName(),
                        Collectors.counting()
                ));
        stats.setOrdersByService(ordersByService);

        return stats;
    }
}



