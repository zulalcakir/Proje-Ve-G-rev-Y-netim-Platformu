package com.example.demo.controller;

import com.example.demo.dto.LoginRequest;
import com.example.demo.model.User;
import com.example.demo.service.AuthService;
import com.example.demo.service.LoginAttemptService;
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

    // YENİ EKLENDİ: Hatalı girişleri sayacak olan servisimizi bağlıyoruz
    @Autowired
    private LoginAttemptService loginAttemptService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        String username = loginRequest.getUsername();

        // 1. ADIM: Güvenlik Kontrolü
        // Kullanıcı daha önce üst üste çok fazla hatalı giriş yaptıysa,
        // veritabanını hiç yormadan direkt 403 (Yasak) hatası döndürüyoruz.
        if (loginAttemptService.isBlocked(username)) {
            return ResponseEntity.status(403).body("Çok fazla hatalı giriş yaptınız. Güvenlik nedeniyle hesabınız kilitlendi.");
        }

        // 2. ADIM: Kullanıcı bilgilerini doğrula
        User user = authService.authenticate(username, loginRequest.getPassword());
        
        if (user != null) {
            // Şifre doğruysa, adam başarıyla içeri girdi demektir.
            // Geçmişteki hata sayacını tamamen sıfırlıyoruz.
            loginAttemptService.loginSucceeded(username);

            // Kullanıcının rolünü al
            String role = user.getRoles().isEmpty() ? "ROLE_USER" : user.getRoles().iterator().next().getName();
            
            // Token süresini belirle ve üret
            String token = jwtUtil.generateToken(user.getUsername(), role, loginRequest.isRememberMe());

            // Yanıt paketini oluştur
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", user);

            return ResponseEntity.ok(response); 
        }
        
        // 3. ADIM: Eğer kod buraya kadar düştüyse, şifre yanlış demektir.
        // Hata sayacını 1 artırıyoruz. 5 olunca yukarıdaki 1. Adım devreye girecek.
        loginAttemptService.loginFailed(username);
        
        return ResponseEntity.status(401).body("Hata: Kullanıcı adı veya şifre yanlış.");
    }
}