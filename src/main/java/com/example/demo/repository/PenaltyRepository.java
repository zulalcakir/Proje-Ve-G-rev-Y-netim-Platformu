package com.example.demo.repository;

import com.example.demo.model.Penalty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PenaltyRepository extends JpaRepository<Penalty, Long> {

    // Kullanıcı ID'sine göre tüm cezaları listele
    List<Penalty> findByUserId(Long userId);

    // Kullanıcının toplam ceza puanını hesapla
    @Query("SELECT SUM(p.penaltyScore) FROM Penalty p WHERE p.user.id = :userId")
    Integer findTotalPenaltyByUserId(@Param("userId") Long userId);
}