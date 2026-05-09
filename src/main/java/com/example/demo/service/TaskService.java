package com.example.demo.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.Task;
import com.example.demo.model.TaskStatus;
import com.example.demo.repository.TaskRepository;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ActivityLogService logService; // İşlemleri loglamak için

    // 1. Tüm görevleri getir
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    // 2. ID ile tek bir görev getir
    public Task getTaskById(Long id) {
        return taskRepository.findById(id).orElse(null);
    }

    // 3. Projeye göre görevleri getir
    public List<Task> getTasksByProject(Long projectId) {
        return taskRepository.findByProjectId(projectId);
    }

    // 4. Kullanıcıya atanmış görevleri getir (Dashboard için kritik)
    public List<Task> getTasksByUser(Long userId) {
        return taskRepository.findByAssignedToId(userId);
    }

    // 5. Yeni görev oluştur veya güncelle
    public Task saveTask(Task task) {
        return taskRepository.save(task);
    }

    // 6. KRİTİK: Görev Durumunu Güncelle ve Otomatik Log Tut
    public Task updateTaskStatus(Long taskId, TaskStatus newStatus) {
        Task task = taskRepository.findById(taskId).orElse(null);
        
        if (task != null) {
            TaskStatus oldStatus = task.getStatus();
            task.setStatus(newStatus);
            Task updatedTask = taskRepository.save(task);
            
            // Sistem günlüğüne (Activity Log) bu değişikliği kaydediyoruz
            String logMsg = "Görev durumu güncellendi: '" + task.getTitle() + "' (" + oldStatus + " -> " + newStatus + ")";
            logService.logAction(logMsg, task.getAssignedTo());
            
            return updatedTask;
        }
        return null;
    }

    // 7. Görev sil
    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    // 8. Kullanıcı istatistiklerini getir (Dashboard sayaçları için)
    public long getCompletedTaskCount(Long userId) {
        return taskRepository.countByAssignedToIdAndStatus(userId, TaskStatus.TAMAMLANDI);
    }
}