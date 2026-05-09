package com.example.demo.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Task;
import com.example.demo.model.TaskStatus;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    // 1. Proje bazlı görevleri listeleme
    List<Task> findByProjectId(Long projectId);
    
    // 2. Kullanıcı bazlı görevleri listeleme (Dashboard için kritik)
    List<Task> findByAssignedToId(Long userId);
    
    // 3. Durum bazlı görevleri listeleme (Örn: Sadece bitenleri getir)
    List<Task> findByStatus(TaskStatus status);
    
    // 4. Belirli bir projeye ait, belirli bir durumdaki görevleri listeleme
    List<Task> findByProjectIdAndStatus(Long projectId, TaskStatus status);

    // 5. İstatistikler için sayım metotları (Query yazmadan otomatik çalışır)
    long countByAssignedToId(Long userId); // Kullanıcının toplam kaç görevi var?
    long countByAssignedToIdAndStatus(Long userId, TaskStatus status); // Kullanıcının kaç tamamlanmış görevi var?
}