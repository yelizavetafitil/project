package com.example.backend.controller;

import com.example.backend.dto.CreateOrderRequest;
import com.example.backend.dto.OrderDto;
import com.example.backend.dto.ProviderStatsDto;
import com.example.backend.model.Order;
import com.example.backend.model.User;
import com.example.backend.service.OrderService;
import com.example.backend.service.ProviderStatsService;
import com.example.backend.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order management endpoints")
public class OrderController {

    private final OrderService orderService;
    private final ProviderStatsService providerStatsService;
    private final SecurityUtil securityUtil;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all orders")
    public ResponseEntity<List<OrderDto>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID")
    public ResponseEntity<OrderDto> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/my-orders")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current user orders (as customer)")
    public ResponseEntity<List<OrderDto>> getMyOrders(Authentication authentication) {
        // Всегда возвращаем заказы, где пользователь является клиентом
        Long userId = securityUtil.getUserIdFromAuthentication(authentication);
        return ResponseEntity.ok(orderService.getOrdersByCustomer(userId));
    }

    @GetMapping("/my-provider-orders")
    @PreAuthorize("hasAnyRole('PROVIDER', 'ADMIN')")
    @Operation(summary = "Get orders for provider's services")
    public ResponseEntity<List<OrderDto>> getMyProviderOrders(Authentication authentication) {
        // Возвращаем заказы, где пользователь является исполнителем
        Long providerId = securityUtil.getUserIdFromAuthentication(authentication);
        return ResponseEntity.ok(orderService.getOrdersByProvider(providerId));
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get orders by customer (Admin only)")
    public ResponseEntity<List<OrderDto>> getOrdersByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(orderService.getOrdersByCustomer(customerId));
    }

    @GetMapping("/provider/{providerId}")
    @Operation(summary = "Get orders by provider")
    public ResponseEntity<List<OrderDto>> getOrdersByProvider(@PathVariable Long providerId) {
        return ResponseEntity.ok(orderService.getOrdersByProvider(providerId));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get orders by status")
    public ResponseEntity<List<OrderDto>> getOrdersByStatus(@PathVariable Order.OrderStatus status) {
        return ResponseEntity.ok(orderService.getOrdersByStatus(status));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'PROVIDER')")
    @Operation(summary = "Create a new order")
    public ResponseEntity<OrderDto> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            Authentication authentication) {
        Long customerId = securityUtil.getUserIdFromAuthentication(authentication);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.createOrder(customerId, request));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('PROVIDER', 'ADMIN')")
    @Operation(summary = "Update order status")
    public ResponseEntity<OrderDto> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam Order.OrderStatus status,
            Authentication authentication) {
        Long providerId = null;
        User.Role role = securityUtil.getUserRoleFromAuthentication(authentication);
        
        // Если PROVIDER, проверяем что заказ принадлежит ему
        if (role == User.Role.PROVIDER) {
            providerId = securityUtil.getUserIdFromAuthentication(authentication);
        }
        
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status, providerId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Cancel order")
    public ResponseEntity<Void> cancelOrder(@PathVariable Long id) {
        orderService.cancelOrder(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/provider/stats")
    @PreAuthorize("hasAnyRole('PROVIDER', 'ADMIN')")
    @Operation(summary = "Get provider statistics")
    public ResponseEntity<ProviderStatsDto> getProviderStats(Authentication authentication) {
        Long providerId = securityUtil.getUserIdFromAuthentication(authentication);
        return ResponseEntity.ok(providerStatsService.getProviderStats(providerId));
    }

}

