package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) 
            .authorizeHttpRequests(auth -> auth
                // 1. Herkese açık olan yollar (Login, Register ve Statik dosyalar)
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/users").permitAll()
                .requestMatchers("/", "/index.html", "/style.css", "/app.js", "/dashboard.html", "/dashboard.js").permitAll() 
                .requestMatchers("/static/**", "/css/**", "/js/**", "/images/**").permitAll()
                
                // 2. Kullanıcı listesi gibi kritik yerler (Sadece ADMIN görebilir)
                .requestMatchers("/api/users/**").hasRole("ADMIN")
                
                // 3. Geri kalan her şey için giriş yapılmış olması şart
                .anyRequest().authenticated()
            )
            // 4. POSTMAN DESTEĞİ İÇİN KRİTİK: Basic Auth özelliğini açıyoruz
            .httpBasic(Customizer.withDefaults())
            
            // 5. H2 Console ve Frame ayarları (Aiven olsa da kalmasında zarar yok)
            .headers(headers -> headers.frameOptions(frame -> frame.disable()));
            
        return http.build();
    }
}