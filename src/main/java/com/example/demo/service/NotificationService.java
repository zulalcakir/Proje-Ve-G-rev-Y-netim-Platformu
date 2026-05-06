package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.Notification;
import com.example.demo.repository.NotificationRepository;

@Service
public class NotificationService {
    @Autowired private NotificationRepository notificationRepository;
    public List<Notification> getUnreadNotifications(Long userId) { 
        return notificationRepository.findByUserIdAndIsReadFalse(userId); 
    }
}