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
        // 1. Adım: Kullanıcının girdiği ad ve şifreyi veritabanında ara
        User user = authService.authenticate(loginRequest.getUsername(), loginRequest.getPassword());
        
        // 2. Adım: Eğer kullanıcı bulunduysa ve şifre doğruysa (user null değilse)
        if (user != null) {
            // Yetkisine (Admin/Üye) bakmaksızın girişine onay ver ve bilgileri frontend'e gönder
            return ResponseEntity.ok(user); 
        }
        
        // 3. Adım: Kullanıcı yoksa veya şifre yanlışsa 401 hatası fırlat
        return ResponseEntity.status(401).body("Hata: Kullanıcı adı veya şifre yanlış.");
    }
}