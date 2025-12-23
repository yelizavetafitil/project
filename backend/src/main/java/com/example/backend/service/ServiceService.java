package com.example.backend.service;

import com.example.backend.dto.ServiceDto;
import com.example.backend.model.Category;
import com.example.backend.model.User;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.ServiceRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceService {

    private final ServiceRepository serviceRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ReviewService reviewService;

    @Cacheable(value = "services")
    public List<ServiceDto> getAllServices() {
        return serviceRepository.findByActiveTrue().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "services", key = "#id")
    public ServiceDto getServiceById(Long id) {
        com.example.backend.model.Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        return convertToDto(service);
    }

    public List<ServiceDto> getServicesByCategory(Long categoryId) {
        return serviceRepository.findByCategoryIdAndActiveTrue(categoryId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ServiceDto> getServicesByProvider(Long providerId) {
        return serviceRepository.findByProviderId(providerId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "services", allEntries = true)
    public ServiceDto createService(ServiceDto serviceDto) {
        Category category = categoryRepository.findById(serviceDto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        com.example.backend.model.Service service = new com.example.backend.model.Service();
        service.setName(serviceDto.getName());
        service.setDescription(serviceDto.getDescription());
        service.setPrice(serviceDto.getPrice());
        service.setDurationMinutes(serviceDto.getDurationMinutes());
        service.setImageUrl(serviceDto.getImageUrl());
        service.setCategory(category);
        service.setActive(true);

        if (serviceDto.getProviderId() != null) {
            User provider = userRepository.findById(serviceDto.getProviderId())
                    .orElseThrow(() -> new RuntimeException("Provider not found"));
            service.setProvider(provider);
        }

        service = serviceRepository.save(service);
        return convertToDto(service);
    }

    @Transactional
    @CacheEvict(value = "services", allEntries = true)
    public ServiceDto updateService(Long id, ServiceDto serviceDto) {
        com.example.backend.model.Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        service.setName(serviceDto.getName());
        service.setDescription(serviceDto.getDescription());
        service.setPrice(serviceDto.getPrice());
        service.setDurationMinutes(serviceDto.getDurationMinutes());
        service.setImageUrl(serviceDto.getImageUrl());

        if (serviceDto.getCategoryId() != null) {
            Category category = categoryRepository.findById(serviceDto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            service.setCategory(category);
        }

        service = serviceRepository.save(service);
        return convertToDto(service);
    }

    @Transactional
    @CacheEvict(value = "services", allEntries = true)
    public void deleteService(Long id) {
        com.example.backend.model.Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        service.setActive(false);
        serviceRepository.save(service);
    }

    private ServiceDto convertToDto(com.example.backend.model.Service service) {
        ServiceDto dto = new ServiceDto();
        dto.setId(service.getId());
        dto.setName(service.getName());
        dto.setDescription(service.getDescription());
        dto.setPrice(service.getPrice());
        dto.setDurationMinutes(service.getDurationMinutes());
        dto.setImageUrl(service.getImageUrl());
        dto.setCategoryId(service.getCategory().getId());
        dto.setCategoryName(service.getCategory().getName());
        dto.setActive(service.getActive());

        if (service.getProvider() != null) {
            dto.setProviderId(service.getProvider().getId());
            dto.setProviderName(service.getProvider().getFirstName() + " " + service.getProvider().getLastName());
        }

     
        var reviewStats = reviewService.getReviewStatsForService(service.getId());
        dto.setAverageRating(reviewStats.getAverageRating());
        dto.setReviewCount(reviewStats.getReviewCount());

        return dto;
    }
}

