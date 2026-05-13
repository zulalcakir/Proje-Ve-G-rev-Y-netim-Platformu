package com.example.demo.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore; // EKLENMESİ ŞART
import java.util.List;

@Entity
@Table(name = "departments")
public class Department {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    // mappedBy = "department" ifadesi, User sınıfındaki "private Department department" alanına bakar.
    // KRİTİK ÇÖZÜM: @JsonIgnore ile backend'in sonsuz döngüye girip çökmesini engelliyoruz!
    @OneToMany(mappedBy = "department") 
    @JsonIgnore
    private List<User> users;

    public Department() {}

    // --- GETTER VE SETTER METOTLARI ---

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
    
    public List<User> getUsers() { 
        return users; 
    }

    public void setUsers(List<User> users) { 
        this.users = users; 
    }
}