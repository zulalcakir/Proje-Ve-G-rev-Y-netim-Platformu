package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    // SecurityConfig içinde tanımladığımız BCrypt şifreleyicisini buraya dahil ediyoruz
    @Autowired
    private PasswordEncoder passwordEncoder;

    public User authenticate(String username, String password) {
        // 1. Kullanıcıyı kullanıcı adına göre veritabanında bul
        User user = userRepository.findByUsername(username).orElse(null);
        
        // 2. GÜNCELLEME: Kullanıcı varsa, girilen ham şifre ile veritabanındaki hashlenmiş şifreyi karşılaştır
        // passwordEncoder.matches(rawPassword, encodedPassword) metodu güvenli doğrulama yapar.
        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            return user;
        }
        
        // Bilgiler eşleşmiyorsa null döndür
        return null;
    }
}