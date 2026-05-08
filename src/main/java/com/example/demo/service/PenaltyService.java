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

    public List<Penalty> getPenaltiesByUserId(Long userId) {
        return penaltyRepository.findByUserId(userId);
    }

    public Integer getTotalPenaltyScore(Long userId) {
        Integer total = penaltyRepository.findTotalPenaltyByUserId(userId);
        return (total != null) ? total : 0;
    }
}