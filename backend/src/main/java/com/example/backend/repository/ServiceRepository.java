package com.example.backend.repository;

import com.example.backend.model.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    List<Service> findByCategoryId(Long categoryId);
    List<Service> findByProviderId(Long providerId);
    List<Service> findByActiveTrue();
    List<Service> findByCategoryIdAndActiveTrue(Long categoryId);
}

