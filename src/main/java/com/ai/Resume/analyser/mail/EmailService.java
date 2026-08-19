package com.ai.Resume.analyser.mail;

import brevo.ApiClient;
import brevo.ApiException;
import brevo.Configuration;
import brevoApi.TransactionalEmailsApi;
import brevoModel.SendSmtpEmail;
import brevoModel.SendSmtpEmailSender;
import brevoModel.SendSmtpEmailTo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Collections;

@Slf4j
@Service
public class EmailService {

    @Value("${apiKey}")
    private String apiKey;

    @Value("${sender-email}")
    private String senderEmail;

    @Autowired
    private TemplateEngine templateEngine;

    /**
     * Send OTP email for email address verification during registration.
     */
    public void sendVerificationOtp(String username, String email, String otp) {
        String maskedEmail = maskEmail(email);
        Context context = new Context();
        context.setVariable("username", username);
        context.setVariable("email", maskedEmail);
        context.setVariable("otp", otp);

        String htmlContent = templateEngine.process("verify-otp", context);
        sendEmail(username, email, "Email verification OTP", htmlContent);
    }

    /**
     * Send OTP email for password reset flow.
     */
    public void sendPasswordResetOtp(String username, String email, String otp) {
        String maskedEmail = maskEmail(email);
        Context context = new Context();
        context.setVariable("username", username);
        context.setVariable("email", maskedEmail);
        context.setVariable("otp", otp);

        String htmlContent = templateEngine.process("reset-otp", context);
        sendEmail(username, email, "Reset password OTP", htmlContent);
    }

    // ── Private helpers ─────────────────────────────────────────────────────────

    private ApiClient buildApiClient() {
        ApiClient apiClient = Configuration.getDefaultApiClient();
        apiClient.setApiKey(apiKey);
        return apiClient;
    }

    private void sendEmail(String recipientName, String recipientEmail, String subject, String htmlContent) {
        if (apiKey == null || apiKey.isBlank() || senderEmail == null || senderEmail.isBlank()) {
            throw new IllegalStateException("Brevo email configuration is incomplete");
        }
        SendSmtpEmail email = new SendSmtpEmail();
        email.setSender(new SendSmtpEmailSender().name("Resume Analyser").email(senderEmail));
        email.setTo(Collections.singletonList(new SendSmtpEmailTo().name(recipientName).email(recipientEmail)));
        email.setSubject(subject);
        email.setHtmlContent(htmlContent);

        try {
            new TransactionalEmailsApi(buildApiClient()).sendTransacEmail(email);
        } catch (ApiException e) {
            log.error("Failed to send email to {}: {}", recipientEmail, e.getMessage());
            throw new RuntimeException("Email sending failed", e);
        }
    }

    private String maskEmail(String email) {
        if (email == null) {
            return "your email address";
        }
        int atIndex = email.indexOf("@");
        if (atIndex <= 0) return "your email address";
        return email.charAt(0) + "*********" + email.substring(atIndex);
    }
}
