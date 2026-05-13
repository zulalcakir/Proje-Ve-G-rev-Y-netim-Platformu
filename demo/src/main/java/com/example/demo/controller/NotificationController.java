package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.Notification;
import com.example.demo.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {
    
    @Autowired 
    private NotificationService notificationService;

    // Kullanıcının okunmamış bildirimlerini getirir
    @GetMapping("/user/{userId}")
    public List<Notification> getUnread(@PathVariable Long userId) { 
        return notificationService.getUnreadNotifications(userId); 
    }

    // --- YENİ EKLENEN UÇ NOKTALAR ---

    // Tekil bildirimi okundu yapar
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    // Kullanıcının tüm bildirimlerini okundu yapar
    @PatchMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }
}