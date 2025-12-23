package com.example.backend.service;

import com.example.backend.dto.CreateOrderRequest;
import com.example.backend.dto.OrderDto;
import com.example.backend.dto.OrderEvent;
import com.example.backend.model.Order;
import com.example.backend.model.User;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.ServiceRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;
    private final KafkaTemplate<String, OrderEvent> kafkaTemplate;
    private final NotificationService notificationService;

    @Value("${kafka.topic.order-events}")
    private String orderEventsTopic;

    @Cacheable(value = "orders", key = "'all'")
    public List<OrderDto> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "orders", key = "#id")
    public OrderDto getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return convertToDto(order);
    }

    public List<OrderDto> getOrdersByCustomer(Long customerId) {
        List<Order> orders = orderRepository.findByCustomerId(customerId);
        return orders.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<OrderDto> getOrdersByProvider(Long providerId) {
        List<Order> orders = orderRepository.findByProviderId(providerId);
        return orders.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "orders", key = "'status_' + #status")
    public List<OrderDto> getOrdersByStatus(Order.OrderStatus status) {
        return orderRepository.findByStatus(status).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "orders", allEntries = true)
    public OrderDto createOrder(Long customerId, CreateOrderRequest request) {
        try {
            User customer = userRepository.findById(customerId)
                    .orElseThrow(() -> new RuntimeException("Customer not found with id: " + customerId));

            com.example.backend.model.Service service = serviceRepository.findById(request.getServiceId())
                    .orElseThrow(() -> new RuntimeException("Service not found with id: " + request.getServiceId()));

            if (request.getScheduledDateTime() == null) {
                throw new RuntimeException("Scheduled date time is required");
            }

            if (service.getPrice() == null) {
                throw new RuntimeException("Service price is not set");
            }

            Order order = new Order();
            order.setCustomer(customer);
            order.setService(service);
            order.setProvider(service.getProvider());
            order.setScheduledDateTime(request.getScheduledDateTime());
            order.setAddress(request.getAddress() != null ? request.getAddress() : customer.getAddress());
            order.setNotes(request.getNotes());
            order.setStatus(Order.OrderStatus.PENDING);
            order.setTotalPrice(service.getPrice());

        order = orderRepository.save(order);


        try {
            OrderEvent event = new OrderEvent(
                    order.getId(),
                    customer.getId(),
                    service.getId(),
                    order.getStatus(),
                    LocalDateTime.now(),
                    "Order created successfully"
            );
            kafkaTemplate.send(orderEventsTopic, event);
        } catch (Exception e) {
            System.err.println("Failed to send Kafka event: " + e.getMessage());
        
        }

        try {
            notificationService.sendNotification(
                    customer.getId(),
                    "ORDER_CREATED",
                    "Order Created",
                    "Your order for " + service.getName() + " has been created successfully"
            );

            if (service.getProvider() != null) {
                notificationService.sendNotification(
                        service.getProvider().getId(),
                        "NEW_ORDER",
                        "New Order",
                        "You have a new order for " + service.getName()
                );
            }
        } catch (Exception e) {
            System.err.println("Failed to send notification: " + e.getMessage());
        
        }

            return convertToDto(order);
        } catch (RuntimeException e) {
            System.err.println("Error in createOrder: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.err.println("Unexpected error in createOrder: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create order: " + e.getMessage(), e);
        }
    }

    @Transactional
    @CacheEvict(value = "orders", allEntries = true)
    public OrderDto updateOrderStatus(Long id, Order.OrderStatus status, Long providerId) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

      
        if (providerId != null && order.getProvider() != null) {
            if (!order.getProvider().getId().equals(providerId)) {
                throw new RuntimeException("Provider can only update status of their own orders");
            }
        }

        order.setStatus(status);
        if (status == Order.OrderStatus.COMPLETED) {
            order.setCompletedAt(LocalDateTime.now());
        }

        order = orderRepository.save(order);


        try {
            OrderEvent event = new OrderEvent(
                    order.getId(),
                    order.getCustomer().getId(),
                    order.getService().getId(),
                    order.getStatus(),
                    LocalDateTime.now(),
                    "Order status updated to " + status
            );
            kafkaTemplate.send(orderEventsTopic, event);
        } catch (Exception e) {
            System.err.println("Failed to send Kafka event: " + e.getMessage());
          
        }


        try {
            notificationService.sendNotification(
                    order.getCustomer().getId(),
                    "ORDER_STATUS_UPDATED",
                    "Order Status Updated",
                    "Your order status has been updated to " + status
            );
        } catch (Exception e) {
            System.err.println("Failed to send notification: " + e.getMessage());
           
        }

        return convertToDto(order);
    }

    @Transactional
    public OrderDto updateOrderStatus(Long id, Order.OrderStatus status) {
        return updateOrderStatus(id, status, null);
    }

    @Transactional
    @CacheEvict(value = "orders", allEntries = true)
    public void cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(Order.OrderStatus.CANCELLED);
        orderRepository.save(order);


        try {
            OrderEvent event = new OrderEvent(
                    order.getId(),
                    order.getCustomer().getId(),
                    order.getService().getId(),
                    Order.OrderStatus.CANCELLED,
                    LocalDateTime.now(),
                    "Order cancelled"
            );
            kafkaTemplate.send(orderEventsTopic, event);
        } catch (Exception e) {
            System.err.println("Failed to send Kafka event: " + e.getMessage());
           
        }

     
        if (order.getProvider() != null) {
            try {
                notificationService.sendNotification(
                        order.getProvider().getId(),
                        "ORDER_CANCELLED",
                        "Order Cancelled",
                        "Order #" + order.getId() + " has been cancelled"
                );
            } catch (Exception e) {
                System.err.println("Failed to send notification: " + e.getMessage());
                
            }
        }
    }

    @Transactional
    @CacheEvict(value = "orders", allEntries = true)
    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
       
        try {
            OrderEvent event = new OrderEvent(
                    order.getId(),
                    order.getCustomer().getId(),
                    order.getService().getId(),
                    order.getStatus(),
                    LocalDateTime.now(),
                    "Order deleted by admin"
            );
            kafkaTemplate.send(orderEventsTopic, event);
        } catch (Exception e) {
            System.err.println("Failed to send Kafka event: " + e.getMessage());
         
        }
        
        orderRepository.deleteById(id);
    }

    private OrderDto convertToDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setCustomerId(order.getCustomer().getId());
        dto.setCustomerName(order.getCustomer().getFirstName() + " " + order.getCustomer().getLastName());
        dto.setServiceId(order.getService().getId());
        dto.setServiceName(order.getService().getName());
        dto.setScheduledDateTime(order.getScheduledDateTime());
        dto.setAddress(order.getAddress());
        dto.setNotes(order.getNotes());
        dto.setStatus(order.getStatus());
        dto.setTotalPrice(order.getTotalPrice());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setCompletedAt(order.getCompletedAt());

        if (order.getProvider() != null) {
            dto.setProviderId(order.getProvider().getId());
            dto.setProviderName(order.getProvider().getFirstName() + " " + order.getProvider().getLastName());
        }

        return dto;
    }
}

