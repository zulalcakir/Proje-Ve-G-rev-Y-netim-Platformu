package com.example.demo.controller;

import com.example.demo.model.Penalty;
import com.example.demo.service.PenaltyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/penalties")
@CrossOrigin("*") // Frontend'den gelen isteklere izin verir
public class PenaltyController {

    private final PenaltyService penaltyService;

    public PenaltyController(PenaltyService penaltyService) {
        this.penaltyService = penaltyService;
    }

    // 1. Kullanıcının tüm ceza detaylarını getirir (Tablo için)
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Penalty>> getUserPenalties(@PathVariable Long userId) {
        List<Penalty> penalties = penaltyService.getPenaltiesByUserId(userId);
        return ResponseEntity.ok(penalties);
    }

    // 2. Kullanıcının toplam ceza puanını getirir (Özet kutusu için)
    @GetMapping("/user/{userId}/total")
    public ResponseEntity<Integer> getTotalScore(@PathVariable Long userId) {
        Integer totalScore = penaltyService.getTotalPenaltyScore(userId);
        // Eğer ceza yoksa null dönmemesi için 0 kontrolü
        return ResponseEntity.ok(totalScore != null ? totalScore : 0);
    }
}