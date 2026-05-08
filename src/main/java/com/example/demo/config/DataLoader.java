package com.example.demo.config;

import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.Set;
import java.util.Optional;

@Component
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder; // Yeni eklenen bağımlılık

    // Constructor üzerinden PasswordEncoder enjekte ediliyor
    public DataLoader(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        
        // 1. Rolleri Kontrol Et ve Oluştur
        if (roleRepository.findByName("ROLE_ADMIN").isEmpty()) {
            Role adminRole = new Role();
            adminRole.setName("ROLE_ADMIN");
            roleRepository.save(adminRole);
            System.out.println(">>> ROLE_ADMIN oluşturuldu.");
        }

        if (roleRepository.findByName("ROLE_USER").isEmpty()) {
            Role userRole = new Role();
            userRole.setName("ROLE_USER");
            roleRepository.save(userRole);
            System.out.println(">>> ROLE_USER oluşturuldu.");
        }

        // 2. Admin Kullanıcısını Kontrol Et ve Oluştur
        if (userRepository.findByUsername("admin").isEmpty()) {
            Optional<Role> adminRoleOpt = roleRepository.findByName("ROLE_ADMIN");
            
            if (adminRoleOpt.isPresent()) {
                User admin = new User();
                admin.setUsername("admin");
                
                // GÜNCELLEME: Şifreyi BCrypt ile şifreliyoruz
                admin.setPassword(passwordEncoder.encode("admin123")); 
                
                admin.setEmail("admin@platform.com");
                admin.setRoles(Set.of(adminRoleOpt.get()));
                
                userRepository.save(admin);
                System.out.println(">>> Admin kullanıcısı (admin / admin123) başarıyla oluşturuldu.");
            }
        } else {
            System.out.println(">>> Sistem hazır: Admin kullanıcısı zaten mevcut.");
        }
    }
}