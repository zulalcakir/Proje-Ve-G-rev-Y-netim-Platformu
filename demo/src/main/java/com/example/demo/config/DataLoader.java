package com.example.demo.config;

import com.example.demo.model.*;
import com.example.demo.repository.*;
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
    private final PriorityRepository priorityRepository;
    private final DepartmentRepository departmentRepository; // YENİ
    private final CategoryRepository categoryRepository; // YENİ
    private final TagRepository tagRepository; // YENİ
    private final PasswordEncoder passwordEncoder;

    // Constructor Injection (Tüm yeni repository'leri ekledik)
    public DataLoader(UserRepository userRepository, RoleRepository roleRepository, PriorityRepository priorityRepository, 
                      DepartmentRepository departmentRepository, CategoryRepository categoryRepository, 
                      TagRepository tagRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.priorityRepository = priorityRepository;
        this.departmentRepository = departmentRepository;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        
        // 1. ROLLER
        if (roleRepository.findByName("ROLE_ADMIN").isEmpty()) {
            Role adminRole = new Role();
            adminRole.setName("ROLE_ADMIN");
            roleRepository.save(adminRole);
            System.out.println(">>> [SİSTEM] ROLE_ADMIN veritabanına eklendi.");
        }

        if (roleRepository.findByName("ROLE_USER").isEmpty()) {
            Role userRole = new Role();
            userRole.setName("ROLE_USER");
            roleRepository.save(userRole);
            System.out.println(">>> [SİSTEM] ROLE_USER veritabanına eklendi.");
        }

        // 2. ÖNCELİKLER
        if (priorityRepository.count() == 0) {
            Priority p1 = new Priority(); p1.setLevel("DÜŞÜK"); p1.setColorCode("#28a745"); priorityRepository.save(p1);
            Priority p2 = new Priority(); p2.setLevel("ORTA"); p2.setColorCode("#ffc107"); priorityRepository.save(p2);
            Priority p3 = new Priority(); p3.setLevel("YÜKSEK"); p3.setColorCode("#fd7e14"); priorityRepository.save(p3);
            Priority p4 = new Priority(); p4.setLevel("KRİTİK"); p4.setColorCode("#dc3545"); priorityRepository.save(p4);
            System.out.println(">>> [SİSTEM] Varsayılan Görev Öncelikleri (Priority) veritabanına eklendi.");
        }

        // --- YENİ EKLENDİ: 3. DEPARTMANLAR ---
        if (departmentRepository.count() == 0) {
            Department d1 = new Department(); d1.setName("Yazılım Geliştirme"); departmentRepository.save(d1);
            Department d2 = new Department(); d2.setName("İnsan Kaynakları"); departmentRepository.save(d2);
            Department d3 = new Department(); d3.setName("Pazarlama & Satış"); departmentRepository.save(d3);
            Department d4 = new Department(); d4.setName("Ar-Ge"); departmentRepository.save(d4);
            System.out.println(">>> [SİSTEM] Varsayılan Departmanlar veritabanına eklendi.");
        }

        // --- YENİ EKLENDİ: 4. KATEGORİLER (Görevler için) ---
        if (categoryRepository.count() == 0) {
            Category c1 = new Category(); c1.setName("Backend Geliştirme"); categoryRepository.save(c1);
            Category c2 = new Category(); c2.setName("Frontend Tasarım"); categoryRepository.save(c2);
            Category c3 = new Category(); c3.setName("Hata Çözümü (Bugfix)"); categoryRepository.save(c3);
            Category c4 = new Category(); c4.setName("Toplantı/Analiz"); categoryRepository.save(c4);
            System.out.println(">>> [SİSTEM] Varsayılan Kategoriler veritabanına eklendi.");
        }

        // --- YENİ EKLENDİ: 5. ETİKETLER (Tags) ---
        if (tagRepository.count() == 0) {
            Tag t1 = new Tag(); t1.setName("Acil"); tagRepository.save(t1);
            Tag t2 = new Tag(); t2.setName("Müşteri Bekliyor"); tagRepository.save(t2);
            Tag t3 = new Tag(); t3.setName("Veritabanı"); tagRepository.save(t3);
            Tag t4 = new Tag(); t4.setName("Araştırma"); tagRepository.save(t4);
            System.out.println(">>> [SİSTEM] Varsayılan Etiketler veritabanına eklendi.");
        }

        // 6. VARSAYILAN ADMİN
        if (userRepository.findByUsername("admin").isEmpty()) {
            Optional<Role> adminRoleOpt = roleRepository.findByName("ROLE_ADMIN");
            
            if (adminRoleOpt.isPresent()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setFullName("Sistem Yöneticisi");
                admin.setEmail("admin@platform.com");
                admin.setPassword(passwordEncoder.encode("admin123")); 
                
                Set<Role> roles = new HashSet<>();
                roles.add(adminRoleOpt.get());
                admin.setRoles(roles);
                
                // YENİ: Admin'e ilk departmanı atayalım (Eğer departmanlar oluştuysa null hatası almamak için)
                departmentRepository.findAll().stream().findFirst().ifPresent(admin::setDepartment);
                
                userRepository.save(admin);
                System.out.println(">>> [SİSTEM] Varsayılan admin hesabı oluşturuldu: (admin / admin123)");
            }
        } else {
            System.out.println(">>> [SİSTEM] Sistem hazır, roller ve tüm veriler zaten mevcut.");
        }
    }
}