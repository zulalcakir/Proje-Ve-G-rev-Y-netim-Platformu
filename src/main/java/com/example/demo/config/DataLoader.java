package com.example.demo.config;

import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.HashSet;
import java.util.Set;
import java.util.Optional;

@Component
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    // Constructor Injection (En sağlam yöntem)
    public DataLoader(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        
        // 1. Rolleri Kontrol Et ve Yoksa Oluştur
        // ROLE_ADMIN oluşturuluyor
        if (roleRepository.findByName("ROLE_ADMIN").isEmpty()) {
            Role adminRole = new Role();
            adminRole.setName("ROLE_ADMIN");
            roleRepository.save(adminRole);
            System.out.println(">>> [SİSTEM] ROLE_ADMIN veritabanına eklendi.");
        }

        // ROLE_USER oluşturuluyor (Kayıt olma hatasını çözen kritik kısım burası!)
        if (roleRepository.findByName("ROLE_USER").isEmpty()) {
            Role userRole = new Role();
            userRole.setName("ROLE_USER");
            roleRepository.save(userRole);
            System.out.println(">>> [SİSTEM] ROLE_USER veritabanına eklendi.");
        }

        // 2. Varsayılan Admin Kullanıcısını Oluştur
        if (userRepository.findByUsername("admin").isEmpty()) {
            Optional<Role> adminRoleOpt = roleRepository.findByName("ROLE_ADMIN");
            
            if (adminRoleOpt.isPresent()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setFullName("Sistem Yöneticisi");
                admin.setEmail("admin@platform.com");
                
                // Şifreyi BCrypt ile güvenli hale getiriyoruz
                admin.setPassword(passwordEncoder.encode("admin123")); 
                
                // Rolleri Set olarak atıyoruz
                Set<Role> roles = new HashSet<>();
                roles.add(adminRoleOpt.get());
                admin.setRoles(roles);
                
                userRepository.save(admin);
                System.out.println(">>> [SİSTEM] Varsayılan admin hesabı oluşturuldu: (admin / admin123)");
            }
        } else {
            System.out.println(">>> [SİSTEM] Sistem hazır, roller ve admin hesabı zaten mevcut.");
        }
    }
}