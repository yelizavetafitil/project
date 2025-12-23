package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private Long id;
    private Long userId;
    private String type;
    private String title;
    private String message;
    private Boolean read;
    private LocalDateTime createdAt;
}
















