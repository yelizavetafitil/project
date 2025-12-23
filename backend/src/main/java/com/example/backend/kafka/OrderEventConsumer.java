package com.example.backend.kafka;

import com.example.backend.dto.OrderEvent;
import com.example.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventConsumer {

    private final NotificationService notificationService;

    @KafkaListener(
        topics = "${kafka.topic.order-events}", 
        groupId = "${spring.kafka.consumer.group-id}",
        autoStartup = "false"
    )
    public void consumeOrderEvent(OrderEvent event, Acknowledgment acknowledgment) {
        try {
            log.info("Received order event: {}", event);

    
            String notificationType = "ORDER_" + event.getStatus().name();
            String title = "Order Update";
            String message = event.getMessage();

            notificationService.sendNotification(
                    event.getCustomerId(),
                    notificationType,
                    title,
                    message
            );

            if (acknowledgment != null) {
                acknowledgment.acknowledge();
            }
        } catch (Exception e) {
            log.error("Error processing order event: {}", e.getMessage(), e);
         
        }
    }
}








