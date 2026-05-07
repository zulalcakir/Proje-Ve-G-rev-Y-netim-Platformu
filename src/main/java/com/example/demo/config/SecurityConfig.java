package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher; // BÜTÜN SİHİR BU SATIRDA

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) 
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/users").permitAll()
                
                // İŞTE DEĞİŞEN KISIM: H2 Konsolu için özel giriş anahtarı tanımladık
                .requestMatchers(new AntPathRequestMatcher("/h2-console/**")).permitAll()
                
                .requestMatchers("/", "/index.html", "/style.css", "/app.js").permitAll() 
                .requestMatchers("/static/**", "/css/**", "/js/**", "/images/**").permitAll()
                .anyRequest().authenticated()
            )
            .headers(headers -> headers.frameOptions(frame -> frame.disable()));
            
        return http.build();
    }
}