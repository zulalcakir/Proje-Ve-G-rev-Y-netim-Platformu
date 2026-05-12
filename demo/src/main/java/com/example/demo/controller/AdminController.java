package com.example.demo.controller;

import com.example.demo.dto.AdminStatsDTO;
import com.example.demo.model.TaskStatus;
import com.example.demo.repository.ProjectRepository;
import com.example.demo.repository.TaskRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')") // SADECE ADMİNLER GİREBİLİR
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired private UserRepository userRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private TaskRepository taskRepository;

    @GetMapping("/stats")
    public AdminStatsDTO getSystemStats() {
        long users = userRepository.count();
        long projects = projectRepository.count();
        long tasks = taskRepository.count();
        long completed = taskRepository.findByStatus(TaskStatus.TAMAMLANDI).size();

        return new AdminStatsDTO(users, projects, tasks, completed);
    }
}