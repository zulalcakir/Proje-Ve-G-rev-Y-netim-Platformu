package com.example.demo.controller;

import com.example.demo.dto.LoginRequest;
import com.example.demo.model.User;
import com.example.demo.service.AuthService;
import com.example.demo.security.JwtUtil; 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Frontend erişimi için
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtil jwtUtil; 

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        // 1. Adım: Kullanıcı bilgilerini doğrula
        User user = authService.authenticate(loginRequest.getUsername(), loginRequest.getPassword());
        
        if (user != null) {
            // Kullanıcının rolünü al
            String role = user.getRoles().isEmpty() ? "ROLE_USER" : user.getRoles().iterator().next().getName();
            
            // KRİTİK GÜNCELLEME: LoginRequest içindeki 'rememberMe' bilgisini JwtUtil'e gönderiyoruz
            // Bu sayede token süresi 1 gün veya 30 gün olarak belirlenecek.
            String token = jwtUtil.generateToken(user.getUsername(), role, loginRequest.isRememberMe());

            // Yanıt paketini oluştur
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", user);

            return ResponseEntity.ok(response); 
        }
        
        // Bilgiler yanlışsa hata dön
        return ResponseEntity.status(401).body("Hata: Kullanıcı adı veya şifre yanlış.");
    }
}