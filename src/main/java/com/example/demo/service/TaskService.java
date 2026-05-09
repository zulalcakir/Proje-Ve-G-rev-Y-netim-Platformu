package com.example.demo.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.model.Task;
import com.example.demo.model.TaskStatus;
import com.example.demo.repository.TaskRepository;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ActivityLogService logService; // İşlemleri loglamak için

    /**
     * Tüm görevleri listeler. 
     * Modeller EAGER olduğu için ilişkili Proje ve Kullanıcı verileri de dolu gelir.
     */
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    /**
     * ID ile tek bir görev arar. Bulunamazsa null döner.
     */
    public Task getTaskById(Long id) {
        return taskRepository.findById(id).orElse(null);
    }

    /**
     * Belirli bir projeye ait tüm görevleri getirir.
     */
    public List<Task> getTasksByProject(Long projectId) {
        return taskRepository.findByProjectId(projectId);
    }

    /**
     * Kullanıcıya atanmış görevleri getirir. Dashboard listesi için kritiktir.
     */
    public List<Task> getTasksByUser(Long userId) {
        return taskRepository.findByAssignedToId(userId);
    }

    /**
     * Yeni görev oluşturur veya mevcudu günceller.
     * @Transactional: Kayıt sırasında hata oluşursa işlemi geri alır, veriyi bozmaz.
     */
    @Transactional
    public Task saveTask(Task task) {
        boolean isNew = (task.getId() == null);
        Task savedTask = taskRepository.save(task);
        
        // Sadece yeni bir görev atandığında log oluştur
        if (isNew && savedTask.getAssignedTo() != null) {
            String logMsg = "Yeni görev atandı: '" + savedTask.getTitle() + "' (Proje: " + savedTask.getProject().getName() + ")";
            logService.logAction(logMsg, savedTask.getAssignedTo());
        }
        
        return savedTask;
    }

    /**
     * Görev durumunu günceller (Örn: BEKLEMEDE -> TAMAMLANDI)
     * Ve bu işlemi otomatik olarak sistem günlüğüne kaydeder.
     */
    @Transactional
    public Task updateTaskStatus(Long taskId, TaskStatus newStatus) {
        Task task = taskRepository.findById(taskId).orElse(null);
        
        if (task != null) {
            TaskStatus oldStatus = task.getStatus();
            task.setStatus(newStatus);
            Task updatedTask = taskRepository.save(task);
            
            // Eğer durum gerçekten değiştiyse log yaz
            if (oldStatus != newStatus) {
                String logMsg = "Görev durumu değişti: '" + task.getTitle() + "' [" + oldStatus + " >> " + newStatus + "]";
                logService.logAction(logMsg, task.getAssignedTo());
            }
            
            return updatedTask;
        }
        return null;
    }

    /**
     * Görevi siler ve silme işlemini loglar.
     */
    @Transactional
    public void deleteTask(Long id) {
        Task task = getTaskById(id);
        if (task != null) {
            String logMsg = "Görev sistemden kaldırıldı: '" + task.getTitle() + "'";
            logService.logAction(logMsg, task.getAssignedTo());
            taskRepository.deleteById(id);
        }
    }

    // --- DASHBOARD SAYAÇLARI İÇİN İSTATİSTİK METOTLARI ---

    /**
     * Kullanıcının bitirdiği toplam görev sayısı.
     */
    public long getCompletedTaskCount(Long userId) {
        return taskRepository.countByAssignedToIdAndStatus(userId, TaskStatus.TAMAMLANDI);
    }

    /**
     * Kullanıcının henüz başlamadığı (Beklemede) görev sayısı.
     */
    public long getPendingTaskCount(Long userId) {
        return taskRepository.countByAssignedToIdAndStatus(userId, TaskStatus.BEKLEMEDE);
    }

    /**
     * Kullanıcının şu an üzerinde çalıştığı görev sayısı.
     */
    public long getOngoingTaskCount(Long userId) {
        return taskRepository.countByAssignedToIdAndStatus(userId, TaskStatus.DEVAM_EDIYOR);
    }
}