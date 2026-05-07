package com.example.demo.config;

import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.Set;

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
        
        // 1. Rolleri Kontrol Et (Yoksa oluştur)
        if (roleRepository.findByName("ROLE_ADMIN").isEmpty()) {
            Role adminRole = new Role();
            adminRole.setName("ROLE_ADMIN");
            roleRepository.save(adminRole);
        }

        if (roleRepository.findByName("ROLE_USER").isEmpty()) {
            Role userRole = new Role();
            userRole.setName("ROLE_USER");
            roleRepository.save(userRole);
        }

        // 2. Admin Kullanıcısını Kontrol Et (Yoksa oluştur)
        if (userRepository.findByUsername("admin").isEmpty()) {
            Role adminRole = roleRepository.findByName("ROLE_ADMIN").get();
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword("admin123"); 
            admin.setEmail("admin@platform.com");
            admin.setRoles(Set.of(adminRole));
            userRepository.save(admin);
            System.out.println(">>> Admin kullanıcısı ilk kez oluşturuldu.");
        } else {
            System.out.println(">>> Admin kullanıcısı zaten veritabanında mevcut, atlanıyor.");
        }
    }
}