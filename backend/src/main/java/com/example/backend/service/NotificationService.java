package com.example.backend.service;

import com.example.backend.dto.NotificationDto;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendNotification(Long userId, String type, String title, String message) {
        try {
            NotificationDto notification = new NotificationDto();
            notification.setUserId(userId);
            notification.setType(type);
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setRead(false);
            notification.setCreatedAt(LocalDateTime.now());


            if (messagingTemplate != null) {
                messagingTemplate.convertAndSend("/topic/notifications/" + userId, notification);
            }
        } catch (Exception e) {
            System.err.println("Failed to send notification via WebSocket: " + e.getMessage());
           
        }
    }

    public void sendBroadcastNotification(String type, String title, String message) {
        try {
            NotificationDto notification = new NotificationDto();
            notification.setType(type);
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setRead(false);
            notification.setCreatedAt(LocalDateTime.now());

          
            if (messagingTemplate != null) {
                messagingTemplate.convertAndSend("/topic/notifications/broadcast", notification);
            }
        } catch (Exception e) {
            System.err.println("Failed to send broadcast notification via WebSocket: " + e.getMessage());

        }
    }
}














