package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize; 
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.User;
import com.example.demo.service.UserService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*") // Dışarıdan gelen taleplere izin veriyoruz
public class UserController {
    
    @Autowired 
    private UserService userService;

    // Herkes (Giriş yapan üyeler ve adminler) listeyi ve detayları görebilir
    @GetMapping 
    public List<User> getAll() { 
        return userService.getAllUsers(); 
    }
    
    @GetMapping("/{id}") 
    public User getById(@PathVariable Long id) { 
        return userService.getUserById(id); 
    }

    // DÜZELTME: Kayıt sayfasından gelen dış kullanıcıların üye olabilmesi için
    // buradaki @PreAuthorize("hasAuthority('ROLE_ADMIN')") kilidini kaldırdık.
    // Artık herkes istek atıp kayıt olabilir.
    @PostMapping 
    public User save(@RequestBody User user) { 
        return userService.saveUser(user); 
    }
    
    // KİLİT 2: SADECE ADMINLER KULLANICI SİLEBİLİR
    // Güvenlik gereği silme yetkisi sadece yöneticilerde kalmalı.
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}") 
    public void delete(@PathVariable Long id) { 
        userService.deleteUser(id); 
    }
}