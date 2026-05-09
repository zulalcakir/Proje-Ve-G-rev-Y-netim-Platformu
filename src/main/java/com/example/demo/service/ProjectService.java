package com.example.demo.service;

import com.example.demo.model.Project;
import com.example.demo.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ActivityLogService logService; // Sistem hareketlerini kaydetmek için

    /**
     * Tüm projeleri listeler. 
     * Admin panelindeki tabloyu besler.
     */
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    /**
     * KRİTİK: Belirli bir yöneticinin (Manager) sorumlu olduğu projeleri getirir.
     * Esra'nın dashboard'undaki "0" sorununu bu metod çözer.
     */
    public List<Project> getProjectsByManager(Long managerId) {
        return projectRepository.findByManagerId(managerId);
    }

    /**
     * ID ile tek bir proje getirir.
     */
    public Project getProjectById(Long id) {
        return projectRepository.findById(id).orElse(null);
    }

    /**
     * Yeni proje oluşturur veya günceller.
     * İşlem başarılı olduğunda sistem günlüğüne log yazar.
     */
    @Transactional
    public Project saveProject(Project project) {
        boolean isNew = (project.getId() == null);
        Project savedProject = projectRepository.save(project);

        // Yeni bir proje başlatıldığında log tutalım
        if (isNew && savedProject.getManager() != null) {
            String logMsg = "Yeni proje başlatıldı: '" + savedProject.getName() + "'";
            logService.logAction(logMsg, savedProject.getManager());
        }

        return savedProject;
    }

    /**
     * Projeyi sistemden siler.
     */
    @Transactional
    public void deleteProject(Long id) {
        Project project = getProjectById(id);
        if (project != null) {
            // Silme işlemini loglayalım
            if (project.getManager() != null) {
                String logMsg = "Proje arşivlendi/silindi: '" + project.getName() + "'";
                logService.logAction(logMsg, project.getManager());
            }
            projectRepository.deleteById(id);
        }
    }
}