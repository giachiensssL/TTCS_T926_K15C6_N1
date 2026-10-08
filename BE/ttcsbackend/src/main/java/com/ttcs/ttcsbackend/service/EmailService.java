package com.ttcs.ttcsbackend.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendActivationEmail(
            String toEmail,
            String username,
            String temporaryPassword) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(toEmail);
        message.setSubject("Kích hoạt tài khoản - Hệ thống TMS");

        message.setText(
                "Xin chào " + username + ",\n\n"
                        + "Tài khoản của bạn đã được tạo thành công.\n\n"
                        + "Tên đăng nhập: " + username + "\n"
                        + "Mật khẩu tạm thời: " + temporaryPassword + "\n\n"
                        + "Vui lòng đăng nhập và đổi mật khẩu sau lần đăng nhập đầu tiên.\n\n"
                        + "Trân trọng,\n"
                        + "Hệ thống TMS");

        mailSender.send(message);
    }
}