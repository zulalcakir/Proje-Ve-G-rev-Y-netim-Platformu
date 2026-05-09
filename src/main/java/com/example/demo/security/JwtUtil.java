package com.example.demo.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {
    
    // GÜVENLİK NOTU: Gerçek projelerde bu anahtarı application.properties içinden almalısın.
    // En az 256-bit uzunluğunda olması (32 karakter+) HS256 algoritması için şarttır.
    private final String SECRET = "ProjeVeGorevYonetimiPlatformuIcinCokGizliBirAnahtar1234567890!";
    
    private final long DEFAULT_EXPIRATION = 86400000; // 1 Gün
    private final long REMEMBER_ME_EXPIRATION = 2592000000L; // 30 Gün

    /**
     * Anahtarı güvenli bir şekilde Base64 formatına uygun baytlara çevirir.
     */
    private Key getSigningKey() {
        byte[] keyBytes = SECRET.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Kullanıcı adı ve rol bilgisini içeren JWT Token üretir.
     */
    public String generateToken(String username, String role, boolean rememberMe) {
        long expirationTime = rememberMe ? REMEMBER_ME_EXPIRATION : DEFAULT_EXPIRATION;
        
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role); // "ROLE_ADMIN" veya "ROLE_USER" formatında olmalı

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Token içinden kullanıcı adını (Subject) okur.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Token içinden rol ("role") bilgisini okur.
     */
    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    /**
     * Token'dan herhangi bir bilgiyi (Claim) güvenli bir şekilde çekmek için yardımcı metot.
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Token'ın süresinin dolup dolmadığını kontrol eder.
     */
    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Token'ın hem süresini hem de kullanıcı adını doğrular.
     */
    public boolean validateToken(String token, String username) {
        try {
            final String extractedUsername = extractUsername(token);
            return (extractedUsername.equals(username) && !isTokenExpired(token));
        } catch (Exception e) {
            return false; // Token bozuksa veya geçersizse direkt false dön
        }
    }

    /**
     * Token'ı parçalara ayıran ve içeriğini (Claims) okuyan ana metot.
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}