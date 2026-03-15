package com.gocart.notificationservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationService {

    private final JavaMailSender mailSender;

    @Value("${notification.email.enabled:false}")
    private boolean emailEnabled;

    @Value("${notification.email.from:no-reply@gocart.local}")
    private String emailFrom;

    public void sendEmail(String recipientEmail, String subject, String message) {
        if (!emailEnabled) {
            return;
        }

        if (recipientEmail == null || recipientEmail.isBlank()) {
            return;
        }

        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setFrom(emailFrom);
            mail.setTo(recipientEmail);
            mail.setSubject(subject);
            mail.setText(message);
            mailSender.send(mail);
        } catch (Exception ex) {
            log.warn("Failed to send notification email to {}: {}", recipientEmail, ex.getMessage());
        }
    }
}
