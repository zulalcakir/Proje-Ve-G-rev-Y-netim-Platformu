package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // API projelerinde CSRF koruması genelde kapatılır
            .authorizeHttpRequests(auth -> auth
                // 1. Giriş uç noktasına herkes erişebilir
                .requestMatchers("/api/auth/**").permitAll()
                
                // 2. Yeni kullanıcı kaydı için POST isteğine izin veriyoruz
                .requestMatchers(HttpMethod.POST, "/api/users").permitAll()
                
                // 3. Veritabanını görebilmek için H2 konsoluna izin veriyoruz
                .requestMatchers("/h2-console/**").permitAll()
                
                // 4. Arayüz (Frontend) dosyalarını dışarıya açıyoruz
                .requestMatchers("/", "/index.html", "/style.css", "/app.js").permitAll() 
                .requestMatchers("/static/**", "/css/**", "/js/**", "/images/**").permitAll()
                
                // 5. Diğer tüm istekler için giriş yapılmış olması şarttır
                .anyRequest().authenticated()
            )
            // H2 Konsolunun frame içinde çalışabilmesi için bu ayar gereklidir
            .headers(headers -> headers.frameOptions(frame -> frame.disable()));
            
        return http.build();
    }
}