package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.demo.model.Project;
import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    
    /**
     * Proje yöneticisinin (Manager) ID'sine göre projeleri listeler.
     * Esra'nın dashboard'undaki "Aktif Projeler" sayısını hesaplamak için kullanılır.
     */
    List<Project> findByManagerId(Long managerId);

    /**
     * Proje ismine göre arama yapmak istersen (Gelecek özellikler için).
     */
    List<Project> findByNameContainingIgnoreCase(String name);
}