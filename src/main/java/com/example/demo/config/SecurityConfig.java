package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) 
            .authorizeHttpRequests(auth -> auth
                // 1. Herkese açık olan yollar
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/users").permitAll()
                .requestMatchers("/", "/index.html", "/style.css", "/app.js", "/dashboard.html", "/dashboard.js", "/admin.html", "/admin.js").permitAll() 
                .requestMatchers("/static/**", "/css/**", "/js/**", "/images/**").permitAll()
                
                // 2. Sadece ADMIN'e açık olan yollar
                .requestMatchers("/api/users/**").hasRole("ADMIN")
                
                // 3. Diğer tüm istekler için giriş şart
                .anyRequest().authenticated()
            )
            // 4. Postman'den gelen giriş bilgilerini kabul et (Basic Auth)
            .httpBasic(Customizer.withDefaults())
            
            // 5. Frame ve H2 ayarları
            .headers(headers -> headers.frameOptions(frame -> frame.disable()));
            
        return http.build();
    }

    // KRİTİK EKLEME: Şifrelerin düz metin olarak karşılaştırılmasını sağlar
    @Bean
    public PasswordEncoder passwordEncoder() {
        // Şimdilik "admin123" gibi düz metin şifreleri kabul etmesi için NoOp kullanıyoruz.
        // İleride BCryptPasswordEncoder'a geçiş yapabiliriz.
        return NoOpPasswordEncoder.getInstance();
    }
}