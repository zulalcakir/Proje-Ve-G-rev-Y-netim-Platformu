package com.example.demo.config;

import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.Set;
import java.util.Optional;

@Component
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public DataLoader(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        
        // 1. Rolleri Kontrol Et ve Oluştur
        // findByName metodu Optional döndüğü için ifPresentOrElse veya isEmpty kontrolü sağlıklıdır
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
        // Username ile kontrol ederek mükerrer kayıt (Unique Result Error) hatasını engelliyoruz
        if (userRepository.findByUsername("admin").isEmpty()) {
            // Rolün var olduğundan emin oluyoruz
            Optional<Role> adminRoleOpt = roleRepository.findByName("ROLE_ADMIN");
            
            if (adminRoleOpt.isPresent()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword("admin123"); // Not: Güvenlik için ileride BCrypt eklenebilir
                admin.setEmail("admin@platform.com");
                admin.setRoles(Set.of(adminRoleOpt.get()));
                
                // User modelinde Email alanı zorunlu tutulduğu için set edilmesi kritiktir
                userRepository.save(admin);
                System.out.println(">>> Admin kullanıcısı (admin / admin123) başarıyla oluşturuldu.");
            }
        } else {
            System.out.println(">>> Sistem hazır: Admin kullanıcısı zaten mevcut.");
        }
    }
}