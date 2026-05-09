package com.example.demo.config;

import com.example.demo.security.JwtFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter; // JWT Bekçimizi dahil ettik

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) 
            
            // DİKKAT 1: Oturum yönetimini STATELESS yaptık (Sunucu hafızasında oturum tutulmayacak, her şey token'da)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .authorizeHttpRequests(auth -> auth
                // 1. Herkese açık olan yollar (Giriş, Kayıt ve Statik Dosyalar)
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/users").permitAll()
                .requestMatchers("/", "/index.html", "/style.css", "/app.js", "/dashboard.html", "/dashboard.js", "/admin.html", "/admin.js").permitAll() 
                .requestMatchers("/static/**", "/css/**", "/js/**", "/images/**").permitAll()
                
                // DİKKAT 2: Artık bu API yollarından sadece giriş yapmış (TOKEN'a sahip) olanlar veri çekebilecek!
                .requestMatchers("/api/projects/**", "/api/tasks/**", "/api/logs/**", "/api/users/**").authenticated()
                
                // Diğer tüm istekler için oturum yönetimi zorunludur
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
            
        // DİKKAT 3: Bizim yazdığımız JwtFilter'ı, Spring'in standart kontrolünden hemen önce çalıştır
        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
            
        return http.build();
    }

    // GÜVENLİ ŞİFRELEME: BCrypt motoru
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}