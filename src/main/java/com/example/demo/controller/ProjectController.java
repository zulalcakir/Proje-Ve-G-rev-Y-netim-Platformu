package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Project;
import com.example.demo.service.ProjectService;

@RestController
@RequestMapping("/api/projects") // Tüm istekler /api/projects ile başlar
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @GetMapping // Tüm projeleri getir (CRUD: Read)
    public List<Project> getAllProjects() {
        return projectService.getAllProjects();
    }

    @PostMapping // Yeni proje oluştur (CRUD: Create)
    public Project createProject(@RequestBody Project project) {
        return projectService.saveProject(project);
    }

    @GetMapping("/{id}") // ID'ye göre proje getir
    public Project getProjectById(@PathVariable Long id) {
        return projectService.getProjectById(id);
    }

    @DeleteMapping("/{id}") // Proje sil (CRUD: Delete)
    public void deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
    }
}