package com.example.backend.controller;

import com.example.backend.dto.AdminStatsDto;
import com.example.backend.dto.CreateOrderRequest;
import com.example.backend.dto.OrderDto;
import com.example.backend.dto.ServiceDto;
import com.example.backend.dto.UserDto;
import com.example.backend.model.Order;
import com.example.backend.model.User;
import com.example.backend.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Administrator management endpoints")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    @Operation(summary = "Get admin statistics")
    public ResponseEntity<AdminStatsDto> getStatistics() {
        return ResponseEntity.ok(adminService.getStatistics());
    }


    @GetMapping("/users")
    @Operation(summary = "Get all users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/users/{id}/status")
    @Operation(summary = "Update user status (active/inactive)")
    public ResponseEntity<UserDto> updateUserStatus(
            @PathVariable Long id,
            @RequestParam Boolean active) {
        return ResponseEntity.ok(adminService.updateUserStatus(id, active));
    }

    @PutMapping("/users/{id}/role")
    @Operation(summary = "Update user role")
    public ResponseEntity<UserDto> updateUserRole(
            @PathVariable Long id,
            @RequestParam User.Role role) {
        return ResponseEntity.ok(adminService.updateUserRole(id, role));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Delete user")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/users")
    @Operation(summary = "Create a new user")
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody UserDto userDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createUser(userDto));
    }


    @GetMapping("/services")
    @Operation(summary = "Get all services")
    public ResponseEntity<List<ServiceDto>> getAllServices() {
        return ResponseEntity.ok(adminService.getAllServices());
    }

    @PutMapping("/services/{id}/status")
    @Operation(summary = "Update service status (active/inactive)")
    public ResponseEntity<ServiceDto> updateServiceStatus(
            @PathVariable Long id,
            @RequestParam Boolean active) {
        return ResponseEntity.ok(adminService.updateServiceStatus(id, active));
    }

    @DeleteMapping("/services/{id}")
    @Operation(summary = "Delete service")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        adminService.deleteService(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/services")
    @Operation(summary = "Create a new service")
    public ResponseEntity<ServiceDto> createService(@Valid @RequestBody ServiceDto serviceDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createService(serviceDto));
    }

    @GetMapping("/orders")
    @Operation(summary = "Get all orders")
    public ResponseEntity<List<OrderDto>> getAllOrders() {
        return ResponseEntity.ok(adminService.getAllOrdersForAdmin());
    }

    @PutMapping("/orders/{id}/status")
    @Operation(summary = "Update order status")
    public ResponseEntity<OrderDto> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam Order.OrderStatus status) {
        return ResponseEntity.ok(adminService.updateOrderStatusByAdmin(id, status));
    }

    @DeleteMapping("/orders/{id}")
    @Operation(summary = "Delete order")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        adminService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/orders")
    @Operation(summary = "Create a new order")
    public ResponseEntity<OrderDto> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            @RequestParam Long customerId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createOrder(request, customerId));
    }
}






