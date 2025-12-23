package com.example.backend.controller;

import com.example.backend.dto.ReviewDto;
import com.example.backend.service.ReviewService;
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
@RequestMapping("/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Review management endpoints")
public class ReviewController {

    private final ReviewService reviewService;
    private final SecurityUtil securityUtil;

    @GetMapping
    @Operation(summary = "Get all reviews")
    public ResponseEntity<List<ReviewDto>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get review by ID")
    public ResponseEntity<ReviewDto> getReviewById(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getReviewById(id));
    }

    @GetMapping("/provider/{providerId}")
    @Operation(summary = "Get reviews by provider")
    public ResponseEntity<List<ReviewDto>> getReviewsByProvider(@PathVariable Long providerId) {
        return ResponseEntity.ok(reviewService.getReviewsByProvider(providerId));
    }

    @GetMapping("/service/{serviceId}")
    @Operation(summary = "Get reviews by service")
    public ResponseEntity<List<ReviewDto>> getReviewsByService(@PathVariable Long serviceId) {
        return ResponseEntity.ok(reviewService.getReviewsByService(serviceId));
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Create a new review")
    public ResponseEntity<ReviewDto> createReview(
            @Valid @RequestBody ReviewDto reviewDto,
            Authentication authentication) {
        Long customerId = securityUtil.getUserIdFromAuthentication(authentication);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.createReview(customerId, reviewDto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Update review")
    public ResponseEntity<ReviewDto> updateReview(
            @PathVariable Long id,
            @Valid @RequestBody ReviewDto reviewDto) {
        return ResponseEntity.ok(reviewService.updateReview(id, reviewDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Delete review")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }

}

