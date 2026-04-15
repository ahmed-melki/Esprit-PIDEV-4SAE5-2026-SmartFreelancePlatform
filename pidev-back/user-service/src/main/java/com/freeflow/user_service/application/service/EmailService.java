package com.freeflow.user_service.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendVerificationEmail(String to, String token) {
        String subject = "Confirme ton inscription - FreeFlow";
        String verificationUrl = "http://localhost:8082/api/users/verify?token=" + token;
        String text = "Clique sur le lien suivant pour activer ton compte :\n" + verificationUrl;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        message.setFrom("community@freeflow.com"); // ← remplace par ton adresse expéditeur

        mailSender.send(message);
    }
}