package com.example.demo.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; 
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.User;
import com.example.demo.service.UserService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*") 
public class UserController {
    
    @Autowired 
    private UserService userService;

    // Tüm kullanıcıları listeleme
    @GetMapping 
    public List<User> getAll() { 
        return userService.getAllUsers(); 
    }
    
    // ID'ye göre kullanıcı getirme
    @GetMapping("/{id}") 
    public User getById(@PathVariable Long id) { 
        return userService.getUserById(id); 
    }

    // GİRİŞ YAPMIŞ KULLANICININ BİLGİLERİNİ GETİR
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Oturum bulunamadı.");
        }
        User user = userService.findByUsername(principal.getName());
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Kullanıcı bulunamadı.");
    }

    // GİRİŞ YAPMIŞ KULLANICININ BİLGİLERİNİ GÜNCELLE
    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@RequestBody User updatedUser, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Oturum bulunamadı.");
        }
        User user = userService.findByUsername(principal.getName());
        if (user != null) {
            // DÜZELTME: .getName() hata veriyordu, .getFullName() ve .setFullName() kullanıldı.
            user.setFullName(updatedUser.getFullName());
            userService.saveUser(user);
            return ResponseEntity.ok("{\"message\": \"Profil başarıyla güncellendi!\"}");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Kullanıcı bulunamadı.");
    }

    // Yeni kullanıcı kaydı (Herkes erişebilir)
    @PostMapping 
    public User save(@RequestBody User user) { 
        return userService.saveUser(user); 
    }
    
    // Kullanıcı silme (Sadece ADMIN)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}") 
    public void delete(@PathVariable Long id) { 
        userService.deleteUser(id); 
    }
}