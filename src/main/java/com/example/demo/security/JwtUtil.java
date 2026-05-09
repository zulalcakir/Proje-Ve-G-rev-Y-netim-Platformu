package com.example.demo.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
    
    // Güvenlik Anahtarı (Bu anahtar sadece sunucuda durmalı. En az 256-bit olmalıdır.)
    private final String SECRET = "ProjeVeGorevYonetimiPlatformuIcinCokGizliBirAnahtar12345!";
    
    // Token Geçerlilik Süresi (1 Gün = 86400000 milisaniye) -> Oturum Zaman Aşımı (Session Timeout) buradan ayarlanır!
    private final long EXPIRATION_TIME = 86400000; 

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    // 1. Kullanıcı başarılı giriş yaptığında Token Üretir
    public String generateToken(String username, String role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role) // Rol bilgisini (ADMIN veya USER) token içine gömüyoruz
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // 2. Token'ın içinden kullanıcı adını okur
    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    // YENİ EKLENEN METOT: Token içinden rol bilgisini okur
    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    // 3. Token'ın süresi dolmuş mu diye kontrol eder
    public boolean isTokenExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }

    // 4. Token'ın tamamen geçerli olup olmadığını doğrular
    public boolean validateToken(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username) && !isTokenExpired(token));
    }

    // Yardimci Metot: Token'ı çözer
    private Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}