package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
// Hibernate'in teknik detaylarının (hayalet nesnelerin) JSON hatası vermesini engeller
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) 
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", updatable = false)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss") // JSON çıkış formatını sabitler
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "end_date")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm") // Frontend'deki datetime-local ile tam uyum
    private LocalDateTime endDate;

    // KRİTİK GÜNCELLEME: LAZY yerine EAGER yaparak "no Session" hatasını çözüyoruz
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdBy;

    // KRİTİK GÜNCELLEME: LAZY yerine EAGER yaparak tablo dolmama sorununu çözüyoruz
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "manager_id")
    private User manager;

    public Project() {}

    // --- MANUEL GETTER VE SETTERLAR ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }

    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }

    public User getManager() { return manager; }
    public void setManager(User manager) { this.manager = manager; }
}