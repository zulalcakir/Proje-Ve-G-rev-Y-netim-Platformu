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
    
    // Güvenlik Anahtarı
    private final String SECRET = "ProjeVeGorevYonetimiPlatformuIcinCokGizliBirAnahtar12345!";
    
    // --- OTURUM SÜRELERİ ---
    private final long DEFAULT_EXPIRATION = 86400000; // 1 Gün (milisaniye)
    private final long REMEMBER_ME_EXPIRATION = 2592000000L; // 30 Gün (milisaniye)

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    /**
     * Kullanıcı için Token üretir. 
     * rememberMe true ise 30 günlük, false ise 1 günlük token oluşturur.
     */
    public String generateToken(String username, String role, boolean rememberMe) {
        // Seçime göre süreyi belirle
        long expirationTime = rememberMe ? REMEMBER_ME_EXPIRATION : DEFAULT_EXPIRATION;

        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Token'ın içinden kullanıcı adını okur
    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    // Token içinden rol bilgisini okur
    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    // Token'ın süresi dolmuş mu diye kontrol eder
    public boolean isTokenExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }

    // Token'ın tamamen geçerli olup olmadığını doğrular
    public boolean validateToken(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username) && !isTokenExpired(token));
    }

    // Yardımcı Metot: Token'ı çözer
    private Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}