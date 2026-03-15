package com.gocart.notificationservice.repository;

import com.gocart.notificationservice.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {

    List<Notification> findTop50ByRecipientUserIdOrRecipientRoleIgnoreCaseOrderByCreatedAtDesc(String recipientUserId, String recipientRole);

    long countByRecipientUserIdAndIsReadFalse(String recipientUserId);

    long countByRecipientRoleIgnoreCaseAndIsReadFalse(String recipientRole);
}
