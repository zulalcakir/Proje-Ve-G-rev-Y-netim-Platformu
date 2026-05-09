package com.example.demo.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Gelen isteğin başlığında (Header) 'Authorization' var mı bak
        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;
        String role = null; // YENİ: Rolü tutacağımız değişken

        // 2. Token varsa ve 'Bearer ' ile başlıyorsa içinden token'ı, kullanıcı adını ve rolünü al
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
                role = jwtUtil.extractRole(jwt); // YENİ: Token içinden rolü alıyoruz
            } catch (Exception e) {
                System.out.println("Geçersiz veya süresi dolmuş Token!");
            }
        }

        // 3. Kullanıcı adı bulunduysa ve sistemde henüz oturum açılmamışsa
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            
            // Token'ın bizim sistemimize ait olup olmadığını ve süresini doğrula
            if (jwtUtil.validateToken(jwt, username)) {
                
                // YENİ: Spring Security'ye kullanıcının rolünü tanıtıyoruz
                List<SimpleGrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(role));
                
                // Her şey yolundaysa Spring Security'ye "Bu adam güvenilir, yetkileriyle içeri al" diyoruz
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        username, null, authorities); // Yetkiler (role) eklendi
                
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        
        // 4. İsteği sonraki aşamalara aktar
        filterChain.doFilter(request, response);
    }
}