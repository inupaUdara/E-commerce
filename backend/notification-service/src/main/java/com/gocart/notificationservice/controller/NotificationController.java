package com.gocart.notificationservice.controller;

import com.gocart.notificationservice.dto.InternalNotificationRequest;
import com.gocart.notificationservice.dto.NotificationResponse;
import com.gocart.notificationservice.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.FORBIDDEN;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
@Tag(name = "Notification", description = "Notification APIs")
public class NotificationController {

    private final NotificationService notificationService;

    @Value("${notification.internal-key:change-me}")
    private String internalKey;

    @PostMapping("/internal/publish")
    @Operation(summary = "Publish internal notification", description = "Publishes a notification from internal services")
    public ResponseEntity<NotificationResponse> publishInternal(
            @RequestHeader(value = "X-Internal-Key", required = false) String key,
            @Valid @RequestBody InternalNotificationRequest request) {

        if (key == null || !key.equals(internalKey)) {
            throw new ResponseStatusException(FORBIDDEN, "Invalid internal key");
        }

        return ResponseEntity.ok(notificationService.publishInternal(request));
    }

    @GetMapping("/me")
    @Operation(summary = "Get my notifications", description = "Returns latest notifications for current user")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return ResponseEntity.ok(notificationService.getMyNotifications(authorization));
    }

    @GetMapping("/me/unread-count")
    @Operation(summary = "Get my unread count", description = "Returns unread notification count")
    public ResponseEntity<Long> getMyUnreadCount(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return ResponseEntity.ok(notificationService.getMyUnreadCount(authorization));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark notification as read", description = "Marks a single notification as read")
    public ResponseEntity<NotificationResponse> markRead(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable String id) {
        return ResponseEntity.ok(notificationService.markRead(authorization, id));
    }

    @PatchMapping("/me/read-all")
    @Operation(summary = "Mark all as read", description = "Marks all latest notifications as read")
    public ResponseEntity<Void> markAllRead(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        notificationService.markAllRead(authorization);
        return ResponseEntity.noContent().build();
    }
}
