package com.example.demo.service;

import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors; // Listeyi filtrelemek için eklendi

@Service
public class UserService {

    @Autowired 
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ActivityLogService logService; 

    /**
     * Tüm kullanıcıları listeler (SADECE AKTİF OLANLARI GETİRİR)
     */
    public List<User> getAllUsers() { 
        return userRepository.findAll().stream()
                .filter(User::isActive) // active = false olanlar gizlenir
                .collect(Collectors.toList()); 
    }

    /**
     * Yeni kullanıcı kaydı yapar (Hataları çözen kritik metot)
     */
    public User saveUser(User user) { 
        // 1. Şifreleme: Şifre varsa BCrypt ile hash'le
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        // 2. HATAYI ÇÖZEN KRİTİK ADIM: 
        // Veritabanı 'active' sütununu boş kabul etmiyordu, burada garantiye alıyoruz.
        user.setActive(true);

        // 3. ROLE_USER Atama: Yeni kayıt olan herkes 'Üye' olur.
        roleRepository.findByName("ROLE_USER").ifPresent(role -> {
            // User modelinde HashSet başlattığımız için .add() güvenle çalışır.
            user.getRoles().add(role);
        });

        // 4. Veritabanına Kayıt
        User savedUser = userRepository.save(user);

        // 5. Admin Paneli İçin Log Kaydı
        try {
            logService.logAction("Yeni kullanıcı kaydı yapıldı: " + savedUser.getUsername(), savedUser);
        } catch (Exception e) {
            // Log yazılamasa bile kayıt işlemi bozulmasın diye try-catch içine aldık
            System.err.println("Sistem Logu Yazılamadı: " + e.getMessage());
        }

        return savedUser; 
    }

    /**
     * ID ile kullanıcı bulur
     */
    public User getUserById(Long id) { 
        return userRepository.findById(id).orElse(null); 
    }

    /**
     * Kullanıcı siler (HARD DELETE YERİNE SOFT DELETE / PASİFE ALMA)
     */
    public void deleteUser(Long id) { 
        userRepository.findById(id).ifPresent(user -> {
            // Veritabanından tamamen silmek yerine pasife alıyoruz (Soft Delete)
            user.setActive(false);
            userRepository.save(user); // Güncellenmiş haliyle kaydediyoruz
            
            try {
                logService.logAction("Kullanıcı sistemden silindi (Pasife alındı): " + user.getUsername(), null);
            } catch (Exception e) {
                System.err.println("Silme logu yazılamadı.");
            }
        });
    }
}