package com.example.backend.repository;

import com.example.backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("SELECT o FROM Order o WHERE o.customer.id = :customerId")
    List<Order> findByCustomerId(@Param("customerId") Long customerId);
    
    @Query("SELECT o FROM Order o WHERE o.provider.id = :providerId")
    List<Order> findByProviderId(@Param("providerId") Long providerId);
    
    List<Order> findByStatus(Order.OrderStatus status);
    long countByStatus(Order.OrderStatus status);
}

