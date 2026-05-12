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

        // 1. Authorization Başlığını Al
        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;
        String role = null;

        // 2. Token Yapısını Kontrol Et
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
                role = jwtUtil.extractRole(jwt); // Token içinden rolü al
            } catch (Exception e) {
                // Konsola hata basmak, neden 401 aldığını anlamanı sağlar
                System.out.println("JWT Ayıklama Hatası: " + e.getMessage());
            }
        }

        // 3. Doğrulama ve Güvenlik Bağlamına Ekleme
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            
            if (jwtUtil.validateToken(jwt, username)) {
                
                // KRİTİK DÜZELTME: Rolün başında ROLE_ var mı kontrol et
                // Eğer veritabanında/token'da sadece "ADMIN" yazıyorsa, Spring bunu "ROLE_ADMIN" olarak ister.
                if (role != null && !role.startsWith("ROLE_")) {
                    role = "ROLE_" + role;
                }

                // Rol null ise boş bir liste atayarak hata almayı engelle
                List<SimpleGrantedAuthority> authorities = (role != null) 
                    ? Collections.singletonList(new SimpleGrantedAuthority(role)) 
                    : Collections.emptyList();

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        username, null, authorities);
                
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // Spring Security'ye kullanıcının artık onaylandığını bildir
                SecurityContextHolder.getContext().setAuthentication(authToken);
                
                System.out.println("Kullanıcı başarıyla doğrulandı: " + username + " | Rol: " + role);
            }
        }
        
        // 4. Filtre zincirine devam et
        filterChain.doFilter(request, response);
    }
}