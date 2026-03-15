package com.gocart.orderservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InternalNotificationRequest {
    private String recipientUserId;
    private String recipientRole;
    private String recipientEmail;
    private String type;
    private String title;
    private String message;
    private String entityId;
}
