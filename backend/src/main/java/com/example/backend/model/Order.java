package com.example.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "service_id", nullable = false)
    private com.example.backend.model.Service service;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "provider_id")
    private User provider;

    @NotNull
    @Column(nullable = false)
    private LocalDateTime scheduledDateTime;

    private String address;

    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    @Column(nullable = false)
    private BigDecimal totalPrice;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime completedAt;

    public enum OrderStatus {
        PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED
    }
}

