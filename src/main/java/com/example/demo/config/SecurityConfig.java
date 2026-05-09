package com.example.demo.config;

import com.example.demo.security.JwtFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Controller'larda @PreAuthorize kullanımını aktif eder
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1. CORS Yapılandırmasını Aktif Et (Tarayıcı engellerini aşmak için)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // 2. CSRF'i Devre Dışı Bırak (Stateless API için gereklidir)
            .csrf(csrf -> csrf.disable()) 
            
            // 3. Oturum Yönetimi: STATELESS (JWT kullandığımız için sunucuda oturum yok)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .authorizeHttpRequests(auth -> auth
                // Herkese açık yollar
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/users").permitAll() // Kayıt olma
                
                // Statik dosyalar ve sayfalar (Frontend erişimi)
                .requestMatchers("/", "/index.html", "/style.css", "/app.js", "/dashboard.html", "/dashboard.js", "/admin.html", "/admin.js").permitAll() 
                .requestMatchers("/static/**", "/css/**", "/js/**", "/images/**").permitAll()
                
                // API uçları için yetkilendirme
                .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN") // İstatistikler vb. sadece Admin
                .requestMatchers("/api/users/**").hasAuthority("ROLE_ADMIN") // Kullanıcı yönetimi sadece Admin
                .requestMatchers("/api/projects/**", "/api/tasks/**", "/api/logs/**").authenticated() // Diğerleri giriş yapmış olmalı
                
                // Diğer tüm istekler doğrulanmalı
                .anyRequest().authenticated()
            )
            
            // 4. Yetkisiz girişlerde Pop-up yerine 401 dön
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
            )
            
            // 5. H2 Console veya Frame kullanan yapılar için
            .headers(headers -> headers.frameOptions(frame -> frame.disable()));
            
        // 6. JWT Filtresini standart filtrelerin önüne ekle
        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
            
        return http.build();
    }

    // --- KRİTİK: CORS YAPILANDIRMASI ---
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Frontend'in çalıştığı adreslere izin ver (Geliştirme aşamasında hepsi için "*" kullanılabilir)
        configuration.setAllowedOriginPatterns(List.of("*")); 
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Auth-Token"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true); // Token bazlı işlemlerde true olması önerilir
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}