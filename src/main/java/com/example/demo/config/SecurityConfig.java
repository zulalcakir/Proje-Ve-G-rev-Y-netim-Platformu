package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // API projelerinde CSRF genelde kapatılır
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll() // Giriş uç noktasına herkes erişsin
                .requestMatchers("/h2-console/**").permitAll() // Veritabanını görebilmek için
                
                // --- GÜNCELLEME: Arayüz dosyalarını dışarıya açıyoruz ---
                .requestMatchers("/", "/index.html", "/style.css", "/app.js").permitAll() 
                .requestMatchers("/static/**", "/css/**", "/js/**", "/images/**").permitAll()
                
                .anyRequest().authenticated() // Diğer her şey için giriş şart
            )
            .headers(headers -> headers.frameOptions(frame -> frame.disable())); // H2 Konsolu için şart
            
        return http.build();
    }
}