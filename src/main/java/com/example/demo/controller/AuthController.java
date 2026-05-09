package com.example.demo.controller;

import com.example.demo.dto.LoginRequest;
import com.example.demo.model.User;
import com.example.demo.service.AuthService;
import com.example.demo.service.LoginAttemptService;
import com.example.demo.service.UserService; // YENİ EKLENDİ
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
    private UserService userService; // YENİ EKLENDİ

    @Autowired
    private JwtUtil jwtUtil; 

    @Autowired
    private LoginAttemptService loginAttemptService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        String username = loginRequest.getUsername();

        // 1. ADIM: Güvenlik Kontrolü (Brute Force)
        if (loginAttemptService.isBlocked(username)) {
            return ResponseEntity.status(403).body("Çok fazla hatalı giriş yaptınız. Güvenlik nedeniyle hesabınız kilitlendi.");
        }

        // 2. ADIM: Kullanıcı bilgilerini doğrula
        User user = authService.authenticate(username, loginRequest.getPassword());
        
        if (user != null) {
            loginAttemptService.loginSucceeded(username);

            // Kullanıcının rolünü al
            String role = user.getRoles().isEmpty() ? "ROLE_USER" : user.getRoles().iterator().next().getName();
            
            // Token üret
            String token = jwtUtil.generateToken(user.getUsername(), role, loginRequest.isRememberMe());

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", user);

            return ResponseEntity.ok(response); 
        }
        
        // 3. ADIM: Başarısız giriş denemesini kaydet
        loginAttemptService.loginFailed(username);
        
        return ResponseEntity.status(401).body("Hata: Kullanıcı adı veya şifre yanlış.");
    }

    // --- YÖNERGE GEREĞİ EKLENEN ŞİFRE SIFIRLAMA İŞLEMLERİ ---

    /**
     * 1. ADIM: Şifre sıfırlama kodu talep etme.
     * Kullanıcı e-postasını girer, sistem bir kod üretip konsola basar.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        User user = userService.getUserByEmail(email); // UserService üzerinden email ile bul
        
        if (user != null) {
            String token = userService.generateResetToken(user); // 8 haneli token üret
            
            // SİMÜLASYON: Gerçek mail servisi yerine kodu konsola basıyoruz (Yönerge için yeterli)
            System.out.println(">>> [SİSTEM - ŞİFRE SIFIRLAMA]: Kullanıcı " + user.getUsername() + " için kod üretildi: " + token);
            
            return ResponseEntity.ok("Şifre sıfırlama kodu oluşturuldu. Lütfen backend konsoluna bakın.");
        }
        return ResponseEntity.badRequest().body("Hata: Bu e-posta adresi ile kayıtlı bir kullanıcı bulunamadı.");
    }

    /**
     * 2. ADIM: Alınan kod ile şifreyi güncelleme.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");
        
        // UserService üzerinden token doğrula ve şifreyi değiştir
        boolean success = userService.resetPassword(token, newPassword);
        
        if (success) {
            return ResponseEntity.ok("Şifreniz başarıyla güncellendi. Yeni şifrenizle giriş yapabilirsiniz.");
        }
        return ResponseEntity.badRequest().body("Hata: Geçersiz veya süresi dolmuş sıfırlama kodu.");
    }
}