package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // Örn: ROLE_ADMIN, ROLE_USER

    // VS Code'da sağ tık -> Source Action -> Generate Getters and Setters
    // adımlarını izleyerek id ve name için getter/setter metotlarını hızlıca oluşturabilirsin.
}