package com.example.backend.service;

import com.example.backend.dto.AdminStatsDto;
import com.example.backend.dto.CreateOrderRequest;
import com.example.backend.dto.OrderDto;
import com.example.backend.dto.ServiceDto;
import com.example.backend.dto.UserDto;
import com.example.backend.model.Category;
import com.example.backend.model.Order;
import com.example.backend.model.User;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.ServiceRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.OrderService;
import com.example.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final OrderRepository orderRepository;
    private final CategoryRepository categoryRepository;
    private final UserService userService;
    private final OrderService orderService;
    private final PasswordEncoder passwordEncoder;

    public AdminStatsDto getStatistics() {
        AdminStatsDto stats = new AdminStatsDto();

  
        long totalUsers = userRepository.count();
        long totalCustomers = userRepository.countByRole(User.Role.CUSTOMER);
        long totalProviders = userRepository.countByRole(User.Role.PROVIDER);
        
        stats.setTotalUsers(totalUsers);
        stats.setTotalCustomers(totalCustomers);
        stats.setTotalProviders(totalProviders);

        long totalServices = serviceRepository.count();
        stats.setTotalServices(totalServices);

        long totalOrders = orderRepository.count();
        long pendingOrders = orderRepository.countByStatus(Order.OrderStatus.PENDING);
        long completedOrders = orderRepository.countByStatus(Order.OrderStatus.COMPLETED);
        long cancelledOrders = orderRepository.countByStatus(Order.OrderStatus.CANCELLED);

        stats.setTotalOrders(totalOrders);
        stats.setPendingOrders(pendingOrders);
        stats.setCompletedOrders(completedOrders);
        stats.setCancelledOrders(cancelledOrders);


        BigDecimal totalRevenue = orderRepository.findAll().stream()
                .filter(order -> order.getStatus() == Order.OrderStatus.COMPLETED)
                .map(Order::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.setTotalRevenue(totalRevenue);

        Map<String, Long> ordersByStatus = new HashMap<>();
        for (Order.OrderStatus status : Order.OrderStatus.values()) {
            ordersByStatus.put(status.name(), orderRepository.countByStatus(status));
        }
        stats.setOrdersByStatus(ordersByStatus);


        Map<String, Long> usersByRole = new HashMap<>();
        for (User.Role role : User.Role.values()) {
            usersByRole.put(role.name(), userRepository.countByRole(role));
        }
        stats.setUsersByRole(usersByRole);

        return stats;
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertUserToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto updateUserStatus(Long userId, Boolean active) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(active);
        user = userRepository.save(user);
        return convertUserToDto(user);
    }

    @Transactional
    public UserDto updateUserRole(Long userId, User.Role role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(role);
        user = userRepository.save(user);
        return convertUserToDto(user);
    }

    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(userId);
    }

    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public UserDto createUser(UserDto userDto) {
        return userService.createUser(userDto);
    }

    public List<ServiceDto> getAllServices() {
        return serviceRepository.findAll().stream()
                .map(this::convertServiceToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ServiceDto updateServiceStatus(Long serviceId, Boolean active) {
        com.example.backend.model.Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        service.setActive(active);
        service = serviceRepository.save(service);
        return convertServiceToDto(service);
    }

    @Transactional
    @CacheEvict(value = "services", allEntries = true)
    public void deleteService(Long serviceId) {
        if (!serviceRepository.existsById(serviceId)) {
            throw new RuntimeException("Service not found");
        }
        serviceRepository.deleteById(serviceId);
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
        service.setActive(serviceDto.getActive() != null ? serviceDto.getActive() : true);

        if (serviceDto.getProviderId() != null) {
            User provider = userRepository.findById(serviceDto.getProviderId())
                    .orElseThrow(() -> new RuntimeException("Provider not found"));
            service.setProvider(provider);
        }

        service = serviceRepository.save(service);
        return convertServiceToDto(service);
    }

    public List<OrderDto> getAllOrdersForAdmin() {
        return orderRepository.findAll().stream()
                .map(this::convertOrderToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderDto updateOrderStatusByAdmin(Long orderId, Order.OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        if (status == Order.OrderStatus.COMPLETED) {
            order.setCompletedAt(java.time.LocalDateTime.now());
        }
        order = orderRepository.save(order);
        return convertOrderToDto(order);
    }

    @Transactional
    @CacheEvict(value = "orders", allEntries = true)
    public void deleteOrder(Long orderId) {
        orderService.deleteOrder(orderId);
    }

    @Transactional
    @CacheEvict(value = "orders", allEntries = true)
    public OrderDto createOrder(CreateOrderRequest request, Long customerId) {
        return orderService.createOrder(customerId, request);
    }

    private UserDto convertUserToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        dto.setRole(user.getRole() != null ? user.getRole().name() : null);
        dto.setActive(user.getActive());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }

    private ServiceDto convertServiceToDto(com.example.backend.model.Service service) {
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
        
        return dto;
    }

    private OrderDto convertOrderToDto(Order order) {
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

