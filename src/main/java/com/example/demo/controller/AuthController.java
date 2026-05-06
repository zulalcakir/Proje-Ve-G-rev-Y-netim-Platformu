package com.example.demo.controller;

import com.example.demo.dto.LoginRequest;
import com.example.demo.model.User;
import com.example.demo.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Frontend erişimi için
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        // Kullanıcıyı doğrula
        User user = authService.authenticate(loginRequest.getUsername(), loginRequest.getPassword());
        
        if (user != null) {
            // "ROLE_ADMIN" yetkisi kontrolü
            boolean isAdmin = user.getRoles().stream()
                                  .anyMatch(role -> role.getName().equals("ROLE_ADMIN"));
            
            if (isAdmin) {
                return ResponseEntity.ok(user); // Admin ise kullanıcı nesnesini dön
            } else {
                return ResponseEntity.status(403).body("Yetkisiz erişim: Admin yetkiniz bulunmuyor.");
            }
        }
        return ResponseEntity.status(401).body("Hata: Kullanıcı adı veya şifre yanlış.");
    }
}