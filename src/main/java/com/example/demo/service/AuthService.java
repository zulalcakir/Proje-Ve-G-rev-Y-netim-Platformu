package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    public User authenticate(String username, String password) {
        // Kullanıcıyı bul
        User user = userRepository.findByUsername(username).orElse(null);
        
        // Kullanıcı varsa ve şifre eşleşiyorsa (Şimdilik düz metin kontrolü, sonra BCrypt ekleyeceğiz)
        if (user != null && user.getPassword().equals(password)) {
            return user;
        }
        return null;
    }
}