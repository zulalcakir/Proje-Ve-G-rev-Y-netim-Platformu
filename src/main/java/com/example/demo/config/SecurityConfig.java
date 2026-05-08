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
                
                /* DİKKAT: Eğer giriş yapmana rağmen Dashboard boş kalıyorsa 
                   geçici olarak aşağıdaki satırı aktif edip (başındaki // silip) test edebilirsin.
                   Ama vize ödevi 'authenticated' (oturum zorunlu) diyorsa en son bunu kapatmalısın.
                */
                // .requestMatchers("/api/projects/**", "/api/tasks/**", "/api/logs/**").permitAll()

                // 2. Rol bazlı yetkilendirme (Sadece ADMIN erişebilir)
                .requestMatchers("/api/users/**").hasRole("ADMIN")
                
                // 3. Diğer tüm istekler için oturum yönetimi zorunludur
                .anyRequest().authenticated()
            )
            
            /* KRİTİK GÜNCELLEME: POP-UP ENGELLEME
               .httpBasic() satırını tamamen sildik. 
               Bunun yerine yetkisiz isteklerde tarayıcıya kutucuk açtırmak yerine 
               sadece 401 hatası dönmesini sağlıyoruz.
            */
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
            )
            
            // 4. Güvenlik gereksinimleri ve Frame ayarları
            .headers(headers -> headers.frameOptions(frame -> frame.disable()));
            
        return http.build();
    }

    // GÜVENLİ ŞİFRELEME: BCrypt motoru
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}