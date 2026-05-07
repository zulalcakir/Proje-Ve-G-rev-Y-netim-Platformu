package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // name alanını hem boş bırakılamaz hem de benzersiz yaptık
    @Column(unique = true, nullable = false)
    private String name;

    // JPA için gerekli boş yapıcı metot
    public Role() {
    }

    // --- GETTER VE SETTERLAR ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}