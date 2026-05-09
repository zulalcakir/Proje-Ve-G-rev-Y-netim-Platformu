package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.Notification;
import com.example.demo.model.User; // YENİ EKLENDİ
import com.example.demo.repository.NotificationRepository;

@Service
public class NotificationService {
    
    @Autowired 
    private NotificationRepository notificationRepository;
    
    // Kullanıcının okunmamış bildirimlerini getirir
    public List<Notification> getUnreadNotifications(Long userId) { 
        return notificationRepository.findByUserIdAndIsReadFalse(userId); 
    }

    // --- YENİ EKLENEN METOTLAR ---

    // Sisteme yeni bir bildirim fırlatır
    public void sendNotification(User user, String message) {
        if(user == null) return;
        Notification notif = new Notification();
        notif.setUser(user);
        notif.setMessage(message);
        notif.setRead(false);
        notificationRepository.save(notif);
    }

    // Tek bir bildirimi okundu olarak işaretler
    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(notif -> {
            notif.setRead(true);
            notificationRepository.save(notif);
        });
    }

    // Kullanıcının tüm bildirimlerini tek tuşla okundu yapar
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalse(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}