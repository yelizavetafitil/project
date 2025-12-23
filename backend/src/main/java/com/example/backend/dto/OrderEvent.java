package com.example.backend.dto;

import com.example.backend.model.Order;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderEvent implements Serializable {
    private Long orderId;
    private Long customerId;
    private Long serviceId;
    private Order.OrderStatus status;
    private LocalDateTime timestamp;
    private String message;
}

