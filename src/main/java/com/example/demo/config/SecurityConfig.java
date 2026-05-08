package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;

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
                
                // İŞTE EKRANIN BOŞ KALMASINI ENGELLEYEN VE VERİLERİ GETİREN SATIR:
                // Arayüzün (admin.js ve dashboard.js) rahatça veri çekebilmesi için bu API yollarını serbest bırakıyoruz
                .requestMatchers("/api/projects/**", "/api/tasks/**", "/api/logs/**", "/api/users/**").permitAll()
                
                // 2. Diğer tüm istekler için oturum yönetimi zorunludur
                .anyRequest().authenticated()
            )
            
            /* POP-UP ENGELLEME:
               Yetkisiz isteklerde tarayıcıya kutucuk açtırmak yerine 
               sadece 401 hatası dönmesini sağlıyoruz.
            */
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
            )
            
            // 3. Güvenlik gereksinimleri ve Frame ayarları
            .headers(headers -> headers.frameOptions(frame -> frame.disable()));
            
        return http.build();
    }

    // GÜVENLİ ŞİFRELEME: BCrypt motoru
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}