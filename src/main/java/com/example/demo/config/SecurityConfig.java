package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) 
            .authorizeHttpRequests(auth -> auth
                // 1. Herkese açık olan yollar (Giriş, Kayıt ve Statik Dosyalar)
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/users").permitAll()
                .requestMatchers("/", "/index.html", "/style.css", "/app.js", "/dashboard.html", "/dashboard.js", "/admin.html", "/admin.js").permitAll() 
                .requestMatchers("/static/**", "/css/**", "/js/**", "/images/**").permitAll()
                
                // 2. Rol bazlı yetkilendirme (Sadece ADMIN erişebilir) [cite: 57]
                .requestMatchers("/api/users/**").hasRole("ADMIN")
                
                // 3. Diğer tüm istekler için oturum yönetimi zorunludur [cite: 55]
                .anyRequest().authenticated()
            )
            // 4. Postman ve harici servis testleri için Basic Auth desteği
            .httpBasic(Customizer.withDefaults())
            
            // 5. Güvenlik gereksinimleri ve Frame ayarları [cite: 70]
            .headers(headers -> headers.frameOptions(frame -> frame.disable()));
            
        return http.build();
    }

    // GÜVENLİ ŞİFRELEME: Şifrelerin BCrypt algoritması ile hashlenmesini sağlar [cite: 60, 74]
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}