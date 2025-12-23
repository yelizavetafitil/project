package com.example.backend.controller;

import com.example.backend.dto.ServiceDto;
import com.example.backend.model.Service;
import com.example.backend.repository.ServiceRepository;
import com.example.backend.service.ServiceService;
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
@RequestMapping("/services")
@RequiredArgsConstructor
@Tag(name = "Services", description = "Service management endpoints")
public class ServiceController {

    private final ServiceService serviceService;
    private final ServiceRepository serviceRepository;
    private final SecurityUtil securityUtil;

    @GetMapping
    @Operation(summary = "Get all active services")
    public ResponseEntity<List<ServiceDto>> getAllServices() {
        return ResponseEntity.ok(serviceService.getAllServices());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get service by ID")
    public ResponseEntity<ServiceDto> getServiceById(@PathVariable Long id) {
        return ResponseEntity.ok(serviceService.getServiceById(id));
    }

    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Get services by category")
    public ResponseEntity<List<ServiceDto>> getServicesByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(serviceService.getServicesByCategory(categoryId));
    }

    @GetMapping("/provider/{providerId}")
    @Operation(summary = "Get services by provider")
    public ResponseEntity<List<ServiceDto>> getServicesByProvider(@PathVariable Long providerId) {
        return ResponseEntity.ok(serviceService.getServicesByProvider(providerId));
    }

    @GetMapping("/my-services")
    @PreAuthorize("hasAnyRole('PROVIDER', 'ADMIN')")
    @Operation(summary = "Get current provider's services")
    public ResponseEntity<List<ServiceDto>> getMyServices(Authentication authentication) {
        Long providerId = securityUtil.getUserIdFromAuthentication(authentication);
        return ResponseEntity.ok(serviceService.getServicesByProvider(providerId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('PROVIDER', 'ADMIN')")
    @Operation(summary = "Create a new service")
    public ResponseEntity<ServiceDto> createService(
            @Valid @RequestBody ServiceDto serviceDto,
            Authentication authentication) {
       
        Long providerId = securityUtil.getUserIdFromAuthentication(authentication);
        if (serviceDto.getProviderId() == null) {
            serviceDto.setProviderId(providerId);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(serviceService.createService(serviceDto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PROVIDER', 'ADMIN')")
    @Operation(summary = "Update service")
    public ResponseEntity<ServiceDto> updateService(
            @PathVariable Long id,
            @Valid @RequestBody ServiceDto serviceDto,
            Authentication authentication) {
   
        Long currentUserId = securityUtil.getUserIdFromAuthentication(authentication);
        Service existingService = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        if (existingService.getProvider() != null && 
            !existingService.getProvider().getId().equals(currentUserId) &&
            !securityUtil.getUserRoleFromAuthentication(authentication).equals(com.example.backend.model.User.Role.ADMIN)) {
            throw new RuntimeException("Provider can only update their own services");
        }
        return ResponseEntity.ok(serviceService.updateService(id, serviceDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PROVIDER', 'ADMIN')")
    @Operation(summary = "Delete service")
    public ResponseEntity<Void> deleteService(
            @PathVariable Long id,
            Authentication authentication) {
       
        Long currentUserId = securityUtil.getUserIdFromAuthentication(authentication);
        Service existingService = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        if (existingService.getProvider() != null && 
            !existingService.getProvider().getId().equals(currentUserId) &&
            !securityUtil.getUserRoleFromAuthentication(authentication).equals(com.example.backend.model.User.Role.ADMIN)) {
            throw new RuntimeException("Provider can only delete their own services");
        }
        serviceService.deleteService(id);
        return ResponseEntity.noContent().build();
    }
}














