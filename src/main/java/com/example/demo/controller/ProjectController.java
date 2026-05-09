package com.example.demo.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.Project;
import com.example.demo.service.ProjectService;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    // 1. Tüm projeleri listele (Admin Paneli için)
    @GetMapping
    public List<Project> getAllProjects() {
        return projectService.getAllProjects();
    }

    /**
     * 2. KRİTİK GÜNCELLEME: Belirli bir yöneticinin (Manager) sorumlu olduğu projeleri getirir.
     * Dashboard'da "Aktif Projeler" sayısının doğru görünmesini sağlar.
     */
    @GetMapping("/managed-by/{userId}")
    public List<Project> getManagedProjects(@PathVariable Long userId) {
        return projectService.getProjectsByManager(userId);
    }

    // 3. ID ile belirli bir projeyi getir
    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
        Project project = projectService.getProjectById(id);
        if (project != null) {
            return ResponseEntity.ok(project);
        }
        return ResponseEntity.notFound().build();
    }

    // 4. Yeni Proje Oluştur (Sadece ADMIN)
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Project> createProject(@RequestBody Project project) {
        try {
            Project savedProject = projectService.saveProject(project);
            return ResponseEntity.ok(savedProject);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // 5. Projeyi Güncelle (Sadece ADMIN)
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Project> updateProject(@PathVariable Long id, @RequestBody Project projectDetails) {
        Project existingProject = projectService.getProjectById(id);
        if (existingProject == null) {
            return ResponseEntity.notFound().build();
        }
        
        existingProject.setName(projectDetails.getName());
        existingProject.setDescription(projectDetails.getDescription());
        existingProject.setEndDate(projectDetails.getEndDate());
        existingProject.setManager(projectDetails.getManager());
        
        Project updatedProject = projectService.saveProject(existingProject);
        return ResponseEntity.ok(updatedProject);
    }

    // 6. Proje Sil (Sadece ADMIN)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        Project project = projectService.getProjectById(id);
        if (project == null) {
            return ResponseEntity.notFound().build();
        }
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }
}