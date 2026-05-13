package com.example.demo.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice // Bu notasyon, sınıfın tüm projeyi tepeden dinleyen bir kalkan olduğunu belirtir
public class GlobalExceptionHandler {

    // Sistemde fırlatılan TÜM "Exception" (Hata) türlerini burada yakalıyoruz
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleAllExceptions(Exception ex) {
        
        // 1. Hatayı Geliştirici (Bizim) İçin Konsola Yazdır
        // Böylece arka planda neyin çöktüğünü sadece biz görebiliriz.
        System.err.println(">>> SİSTEM HATASI YAKALANDI: " + ex.getMessage());
        
        // 2. Kullanıcıya Gidecek Olan GÜVENLİ Yanıtı Hazırla
        Map<String, String> errorResponse = new HashMap<>();
        
        // ASLA hatanın detayını (ex.getMessage()) kullanıcıya dönmüyoruz!
        errorResponse.put("error", "Sistemde geçici bir sorun oluştu. Lütfen daha sonra tekrar deneyiniz.");
        errorResponse.put("status", "500");
        
        // 500 Internal Server Error (Sunucu Hatası) koduyla yanıt dönüyoruz
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}