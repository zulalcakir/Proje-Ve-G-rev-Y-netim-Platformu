package com.example.demo.controller;

import com.example.demo.dto.LoginRequest;
import com.example.demo.model.User;
import com.example.demo.service.AuthService;
import com.example.demo.security.JwtUtil; // JWT aracımızı dahil ettik
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
    private JwtUtil jwtUtil; // Token üretecek olan sınıfı enjekte ettik

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        // 1. Adım: Kullanıcının girdiği ad ve şifreyi veritabanında doğrula
        User user = authService.authenticate(loginRequest.getUsername(), loginRequest.getPassword());
        
        // 2. Adım: Eğer kimlik bilgileri doğruysa (user null değilse)
        if (user != null) {
            // Kullanıcının rolünü al (Eğer rol tanımlanmamışsa varsayılan olarak ROLE_USER ver)
            String role = user.getRoles().isEmpty() ? "ROLE_USER" : user.getRoles().iterator().next().getName();
            
            // Kullanıcıya özel JWT Token üret
            String token = jwtUtil.generateToken(user.getUsername(), role);

            // Token ve kullanıcı bilgilerini bir paket (Map) haline getirip frontend'e gönder
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", user);

            return ResponseEntity.ok(response); 
        }
        
        // 3. Adım: Bilgiler yanlışsa 401 hatası dön
        return ResponseEntity.status(401).body("Hata: Kullanıcı adı veya şifre yanlış.");
    }
}