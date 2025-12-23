package com.example.backend.service;

import com.example.backend.dto.ReviewDto;
import com.example.backend.model.Order;
import com.example.backend.model.Review;
import com.example.backend.model.User;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.ReviewRepository;
import com.example.backend.repository.ServiceRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;

    public List<ReviewDto> getAllReviews() {
        return reviewRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public ReviewDto getReviewById(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        return convertToDto(review);
    }

    public List<ReviewDto> getReviewsByProvider(Long providerId) {
        return reviewRepository.findByProviderId(providerId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ReviewDto> getReviewsByService(Long serviceId) {
        return reviewRepository.findByOrderServiceId(serviceId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public ReviewStats getReviewStatsForService(Long serviceId) {
        List<Review> reviews = reviewRepository.findByOrderServiceId(serviceId);
        if (reviews.isEmpty()) {
            return new ReviewStats(0.0, 0);
        }
        double averageRating = reviews.stream()
                .mapToInt(r -> r.getRating())
                .average()
                .orElse(0.0);
        return new ReviewStats(averageRating, reviews.size());
    }

    @Transactional
    public ReviewDto createReview(Long customerId, ReviewDto reviewDto) {
        Order order = orderRepository.findById(reviewDto.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getCustomer().getId().equals(customerId)) {
            throw new RuntimeException("You can only review your own orders");
        }

        if (order.getStatus() != Order.OrderStatus.COMPLETED) {
            throw new RuntimeException("You can only review completed orders");
        }

        
        reviewRepository.findByOrderId(order.getId()).stream()
                .findFirst()
                .ifPresent(r -> {
                    throw new RuntimeException("Review already exists for this order");
                });

        Review review = new Review();
        review.setOrder(order);
        review.setCustomer(order.getCustomer());
        review.setProvider(order.getProvider());
        review.setRating(reviewDto.getRating());
        review.setComment(reviewDto.getComment());
        review.setCreatedAt(LocalDateTime.now());

        review = reviewRepository.save(review);
        return convertToDto(review);
    }

    @Transactional
    public ReviewDto updateReview(Long id, ReviewDto reviewDto) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        review.setRating(reviewDto.getRating());
        review.setComment(reviewDto.getComment());

        review = reviewRepository.save(review);
        return convertToDto(review);
    }

    @Transactional
    public void deleteReview(Long id) {
        reviewRepository.deleteById(id);
    }

    private ReviewDto convertToDto(Review review) {
        ReviewDto dto = new ReviewDto();
        dto.setId(review.getId());
        dto.setOrderId(review.getOrder().getId());
        dto.setProviderId(review.getProvider().getId());
        dto.setProviderName(review.getProvider().getFirstName() + " " + review.getProvider().getLastName());
        dto.setServiceId(review.getOrder().getService().getId());
        dto.setServiceName(review.getOrder().getService().getName());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setCreatedAt(review.getCreatedAt());
        return dto;
    }

    public static class ReviewStats {
        private final Double averageRating;
        private final Integer reviewCount;

        public ReviewStats(Double averageRating, Integer reviewCount) {
            this.averageRating = averageRating;
            this.reviewCount = reviewCount;
        }

        public Double getAverageRating() {
            return averageRating;
        }

        public Integer getReviewCount() {
            return reviewCount;
        }
    }
}

