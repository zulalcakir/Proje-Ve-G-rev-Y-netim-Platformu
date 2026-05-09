package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.model.User;
import com.example.demo.model.Role;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtUtil;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil; // Token üretmek için dahil ettik

    /**
     * Kullanıcıyı doğrular ve geçerli bir JWT Token döner.
     * @return Token string veya başarısızsa null
     */
    public String login(String username, String password, boolean rememberMe) {
        // 1. Kullanıcıyı bul
        Optional<User> userOptional = userRepository.findByUsername(username);
        
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            
            // 2. Şifre kontrolü (BCrypt matches)
            if (passwordEncoder.matches(password, user.getPassword())) {
                
                // 3. Kullanıcının rolünü al (Örn: ROLE_ADMIN)
                // Birden fazla rolü varsa ilkini alıyoruz, senin sisteminde genelde tek rol olur.
                String role = user.getRoles().stream()
                        .map(Role::getName)
                        .findFirst()
                        .orElse("ROLE_USER");

                // 4. JwtUtil üzerinden içine ROL ve KULLANICI ADI gömülmüş token üret
                return jwtUtil.generateToken(username, role, rememberMe);
            }
        }
        
        // Giriş başarısız
        return null;
    }

    /**
     * Sadece kullanıcı nesnesini doğrulamak gerekirse kullanılır.
     */
    public User authenticate(String username, String password) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            return user;
        }
        return null;
    }
}