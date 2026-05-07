package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin; // Kapıyı açan sihirli anahtarın kütüphanesi
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
@CrossOrigin(origins = "*") // DIŞARIDAN GELEN KAYIT TALEPLERİNE İZİN VERİYORUZ
public class UserController {
    @Autowired private UserService userService;

    @GetMapping public List<User> getAll() { return userService.getAllUsers(); }
    @PostMapping public User save(@RequestBody User user) { return userService.saveUser(user); }
    @GetMapping("/{id}") public User getById(@PathVariable Long id) { return userService.getUserById(id); }
    @DeleteMapping("/{id}") public void delete(@PathVariable Long id) { userService.deleteUser(id); }
}