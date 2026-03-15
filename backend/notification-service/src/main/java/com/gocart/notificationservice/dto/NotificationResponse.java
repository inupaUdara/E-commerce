package com.gocart.notificationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private String id;
    private String recipientUserId;
    private String recipientRole;
    private String type;
    private String title;
    private String message;
    private String entityId;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
