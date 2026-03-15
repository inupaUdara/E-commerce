package com.gocart.orderservice.client;

import com.gocart.orderservice.dto.InternalNotificationRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "notification-service", url = "${notification.service.url}")
public interface NotificationServiceClient {

    @PostMapping("/api/notifications/internal/publish")
    void publishInternal(
            @RequestHeader("X-Internal-Key") String internalKey,
            @RequestBody InternalNotificationRequest request);
}
