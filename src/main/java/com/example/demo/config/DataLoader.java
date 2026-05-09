package com.example.demo.config;

import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.model.Priority; // YENİ EKLENDİ
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.PriorityRepository; // YENİ EKLENDİ
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
    private final PriorityRepository priorityRepository; // YENİ EKLENDİ
    private final PasswordEncoder passwordEncoder;

    // Constructor Injection (En sağlam yöntem)
    public DataLoader(UserRepository userRepository, RoleRepository roleRepository, PriorityRepository priorityRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.priorityRepository = priorityRepository; // YENİ EKLENDİ
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

        // --- YENİ EKLENDİ: ÖNCELİK (PRIORITY) SEVİYELERİNİ OLUŞTUR ---
        // Tablo boşsa varsayılan 4 seviyeyi ekle
        if (priorityRepository.count() == 0) {
            Priority p1 = new Priority(); p1.setLevel("DÜŞÜK"); p1.setColorCode("#28a745"); priorityRepository.save(p1);
            Priority p2 = new Priority(); p2.setLevel("ORTA"); p2.setColorCode("#ffc107"); priorityRepository.save(p2);
            Priority p3 = new Priority(); p3.setLevel("YÜKSEK"); p3.setColorCode("#fd7e14"); priorityRepository.save(p3);
            Priority p4 = new Priority(); p4.setLevel("KRİTİK"); p4.setColorCode("#dc3545"); priorityRepository.save(p4);
            System.out.println(">>> [SİSTEM] Varsayılan Görev Öncelikleri (Priority) veritabanına eklendi.");
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