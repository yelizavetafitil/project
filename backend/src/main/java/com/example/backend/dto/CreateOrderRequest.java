package com.example.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {
    @NotNull
    private Long serviceId;
    
    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm", shape = JsonFormat.Shape.STRING)
    private LocalDateTime scheduledDateTime;
    
    private String address;
    private String notes;
}









