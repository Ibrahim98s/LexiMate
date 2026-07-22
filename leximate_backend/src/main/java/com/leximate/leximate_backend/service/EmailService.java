package com.leximate.leximate_backend.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationCode(String toEmail, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Your LexiMate verification code");
        message.setText(
                "Your verification code is: " + code +
                "\n\nThis code expires in 10 minutes." +
                "\n\nIf you didn't request this, you can ignore this email."
        );
        mailSender.send(message);
    }
}