package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;

@Service
public class UserService {

    @Autowired 
    private UserRepository userRepository;

    // SecurityConfig içinde tanımladığımız şifreleyiciyi buraya çağırıyoruz
    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() { 
        return userRepository.findAll(); 
    }

    public User saveUser(User user) { 
        // Şifreyi veritabanına kaydetmeden önce BCrypt ile hashliyoruz 
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user); 
    }

    public User getUserById(Long id) { 
        return userRepository.findById(id).orElse(null); 
    }

    public void deleteUser(Long id) { 
        userRepository.deleteById(id); 
    }
}