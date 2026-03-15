package com.gocart.notificationservice.service;

import com.gocart.notificationservice.client.UserServiceClient;
import com.gocart.notificationservice.dto.InternalNotificationRequest;
import com.gocart.notificationservice.dto.NotificationResponse;
import com.gocart.notificationservice.dto.UserResponse;
import com.gocart.notificationservice.entity.Notification;
import com.gocart.notificationservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserServiceClient userServiceClient;
    private final EmailNotificationService emailNotificationService;

    @Transactional
    public NotificationResponse publishInternal(InternalNotificationRequest request) {
        Notification notification = Notification.builder()
                .recipientUserId(request.getRecipientUserId())
                .recipientRole(request.getRecipientRole())
                .recipientEmail(request.getRecipientEmail())
                .type(request.getType())
                .title(request.getTitle())
                .message(request.getMessage())
                .entityId(request.getEntityId())
                .build();

        Notification saved = notificationRepository.save(notification);
        emailNotificationService.sendEmail(saved.getRecipientEmail(), saved.getTitle(), saved.getMessage());
        return toResponse(saved);
    }

    public List<NotificationResponse> getMyNotifications(String authorization) {
        UserResponse me = resolveUser(authorization);
        String role = me.getRole() == null ? "" : me.getRole();
        return notificationRepository
                .findTop50ByRecipientUserIdOrRecipientRoleIgnoreCaseOrderByCreatedAtDesc(me.getId(), role)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public long getMyUnreadCount(String authorization) {
        UserResponse me = resolveUser(authorization);
        String role = me.getRole() == null ? "" : me.getRole();
        return notificationRepository.countByRecipientUserIdAndIsReadFalse(me.getId())
                + notificationRepository.countByRecipientRoleIgnoreCaseAndIsReadFalse(role);
    }

    @Transactional
    public NotificationResponse markRead(String authorization, String notificationId) {
        UserResponse me = resolveUser(authorization);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Notification not found"));

        boolean userMatch = notification.getRecipientUserId() != null
                && notification.getRecipientUserId().equals(me.getId());
        boolean roleMatch = notification.getRecipientRole() != null
                && notification.getRecipientRole().equalsIgnoreCase(me.getRole());

        if (!userMatch && !roleMatch) {
            throw new ResponseStatusException(FORBIDDEN, "You are not allowed to update this notification");
        }

        notification.setIsRead(true);
        return toResponse(notificationRepository.save(notification));
    }

    @Transactional
    public void markAllRead(String authorization) {
        UserResponse me = resolveUser(authorization);
        String role = me.getRole() == null ? "" : me.getRole();

        List<Notification> notifications = notificationRepository
                .findTop50ByRecipientUserIdOrRecipientRoleIgnoreCaseOrderByCreatedAtDesc(me.getId(), role);

        for (Notification notification : notifications) {
            notification.setIsRead(true);
        }

        notificationRepository.saveAll(notifications);
    }

    private UserResponse resolveUser(String authorization) {
        if (authorization == null || authorization.isBlank() || !authorization.startsWith("Bearer ")) {
            throw new ResponseStatusException(UNAUTHORIZED, "Authorization token is required");
        }

        try {
            UserResponse user = userServiceClient.getCurrentUser(authorization);
            if (user == null || user.getId() == null) {
                throw new ResponseStatusException(UNAUTHORIZED, "Unable to identify current user");
            }
            return user;
        } catch (Exception ex) {
            throw new ResponseStatusException(UNAUTHORIZED, "Invalid or expired token");
        }
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .recipientUserId(n.getRecipientUserId())
                .recipientRole(n.getRecipientRole())
                .type(n.getType())
                .title(n.getTitle())
                .message(n.getMessage())
                .entityId(n.getEntityId())
                .isRead(n.getIsRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
