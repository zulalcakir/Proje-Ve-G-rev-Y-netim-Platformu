package com.example.demo.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    // Kullanıcı adlarını ve başarısız giriş sayılarını hafızada tutacağımız liste
    private final ConcurrentHashMap<String, Integer> attemptsCache = new ConcurrentHashMap<>();
    
    // Maksimum deneme hakkı
    private final int MAX_ATTEMPT = 5;

    // Kullanıcı başarılı giriş yaparsa, hata sayacını sıfırla
    public void loginSucceeded(String username) {
        attemptsCache.remove(username);
    }

    // Kullanıcı hatalı giriş yaparsa, sayacı 1 artır
    public void loginFailed(String username) {
        int attempts = attemptsCache.getOrDefault(username, 0);
        attempts++;
        attemptsCache.put(username, attempts);
    }

    // Kullanıcı bloke oldu mu? (Hata sayısı maksimumu geçti mi?)
    public boolean isBlocked(String username) {
        return attemptsCache.getOrDefault(username, 0) >= MAX_ATTEMPT;
    }
}