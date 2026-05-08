package com.example.demo.controller;

import com.example.demo.model.Penalty;
import com.example.demo.service.PenaltyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/penalties")
@CrossOrigin("*") // Frontend'den erişim için
public class PenaltyController {

    private final PenaltyService penaltyService;

    public PenaltyController(PenaltyService penaltyService) {
        this.penaltyService = penaltyService;
    }

    // Kullanıcının ceza listesini getirir
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Penalty>> getUserPenalties(@PathVariable Long userId) {
        return ResponseEntity.ok(penaltyService.getPenaltiesByUserId(userId));
    }

    // Kullanıcının toplam ceza puanını getirir
    @GetMapping("/user/{userId}/total")
    public ResponseEntity<Integer> getTotalScore(@PathVariable Long userId) {
        return ResponseEntity.ok(penaltyService.getTotalPenaltyScore(userId));
    }
}