package com.example.demo.service;

import com.example.demo.model.Penalty;
import com.example.demo.model.Task;
import com.example.demo.model.TaskStatus; // Enum karşılaştırması için eklendi
import com.example.demo.repository.PenaltyRepository;
import com.example.demo.repository.TaskRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PenaltyScheduler {

    private final TaskRepository taskRepository;
    private final PenaltyRepository penaltyRepository;

    public PenaltyScheduler(TaskRepository taskRepository, PenaltyRepository penaltyRepository) {
        this.taskRepository = taskRepository;
        this.penaltyRepository = penaltyRepository;
    }

    /**
     * Her 60 saniyede bir otomatik çalışır (fixedRate = 60000 ms).
     * Süresi geçen ama tamamlanmamış görevler için cezayı anlık hesaplar.
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void calculateActivePenalties() {
        LocalDateTime now = LocalDateTime.now();

        // 1. Süresi geçmiş ve tamamlanmamış (TAMAMLANDI dışında kalan) görevleri bul
        // Status Enum olduğu için direkt Enum tipiyle (TaskStatus.TAMAMLANDI) karşılaştırıyoruz.
        List<Task> overdueTasks = taskRepository.findAll().stream()
                .filter(t -> t.getStatus() != TaskStatus.TAMAMLANDI && 
                             t.getDueDate() != null && 
                             t.getDueDate().isBefore(now))
                .toList();

        for (Task task : overdueTasks) {
            // Gecikme süresini dakika bazında hesapla
            long overdueMinutes = Duration.between(task.getDueDate(), now).toMinutes();
            
            if (overdueMinutes > 0) {
                int totalPenalty = (int) (overdueMinutes * 5); // Dakika başına 5 Puan

                // 2. Bu görev için veritabanında zaten bir ceza kaydı var mı kontrol et
                // Görevin ID'sine göre arama yaparak mükerrer (duplicate) kayıt oluşmasını engelliyoruz.
                Penalty penalty = penaltyRepository.findByTaskId(task.getId())
                        .stream()
                        .findFirst()
                        .orElse(new Penalty());

                // 3. Ceza verilerini doldur/güncelle
                penalty.setUser(task.getAssignedToUser()); // Task modelindeki köprü metodu kullanıyoruz
                penalty.setTask(task);
                penalty.setPenaltyScore(totalPenalty);
                penalty.setPenaltyAmount(totalPenalty); // Penalty modeline yeni eklediğimiz alan
                penalty.setReason(overdueMinutes + " dakika gecikme (Sistem tarafından otomatik güncellendi)");
                penalty.setPenaltyDate(now);

                // Veritabanına kaydet (Eğer varsa UPDATE, yoksa INSERT yapar)
                penaltyRepository.save(penalty);
            }
        }
    }
}