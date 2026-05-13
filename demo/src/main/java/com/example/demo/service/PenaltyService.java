package com.example.demo.service;

import com.example.demo.model.Penalty;
import com.example.demo.repository.PenaltyRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PenaltyService {

    private final PenaltyRepository penaltyRepository;

    public PenaltyService(PenaltyRepository penaltyRepository) {
        this.penaltyRepository = penaltyRepository;
    }

    // ADMİN İÇİN YENİ EKLENDİ: Veritabanındaki tüm ceza kayıtlarını getirir
    public List<Penalty> getAllPenalties() {
        return penaltyRepository.findAll();
    }

    // Kullanıcının dakika bazlı ceza geçmişini liste olarak döner
    public List<Penalty> getPenaltiesByUserId(Long userId) {
        return penaltyRepository.findByUserId(userId);
    }

    // Veritabanındaki tüm dakika bazlı puanları toplar, sonuç null ise 0 döner
    public Integer getTotalPenaltyScore(Long userId) {
        Integer total = penaltyRepository.findTotalPenaltyByUserId(userId);
        return (total != null) ? total : 0;
    }
}