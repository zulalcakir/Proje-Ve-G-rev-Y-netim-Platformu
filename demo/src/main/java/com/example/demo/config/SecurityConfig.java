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
@EnableMethodSecurity // @PreAuthorize kullanımını aktif eder
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1. CORS Yapılandırması
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // 2. CSRF Devre Dışı (Stateless API)
            .csrf(csrf -> csrf.disable()) 
            
            // 3. Oturum Yönetimi: STATELESS
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .authorizeHttpRequests(auth -> auth
                // Herkese açık auth işlemleri
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/users").permitAll() // Kayıt olma herkese açık
                
                // STATİK DOSYALAR: profile.html ve profile.js eklendi
                .requestMatchers("/", "/index.html", "/style.css", "/app.js", 
                                 "/dashboard.html", "/dashboard.js", 
                                 "/admin.html", "/admin.js", 
                                 "/projects.html", "/projects.js", 
                                 "/tasks.html", "/tasks.js",
                                 "/profile.html", "/profile.js").permitAll() 
                
                .requestMatchers("/static/**", "/css/**", "/js/**", "/images/**").permitAll()
                
                // --- KRİTİK AYAR: PROFİL GÜNCELLEME İZNİ ---
                // Bu satır, genel /api/users kısıtlamasından önce gelmelidir!
                .requestMatchers("/api/users/me").authenticated() 
                
                // API uçları için yetkilendirme
                .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN") 
                .requestMatchers("/api/users/**").hasAuthority("ROLE_ADMIN") // Diğer kullanıcı işlemleri hala Admin'e kilitli
                
                // Görev, Proje, Dosya ve Yorum işlemleri için sadece giriş yapmış olmak yeterli
                .requestMatchers("/api/projects/**", "/api/tasks/**", "/api/logs/**", 
                                 "/api/comments/**", "/api/attachments/**", "/api/penalties/**").authenticated() 
                
                .anyRequest().authenticated()
            )
            
            // 4. Yetkisiz giriş hatası (401)
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
            )
            
            // 5. H2 ve Frame ayarları
            .headers(headers -> headers.frameOptions(frame -> frame.disable()));
            
        // 6. JWT Filtresini ekle
        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
            
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*")); 
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Auth-Token"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}