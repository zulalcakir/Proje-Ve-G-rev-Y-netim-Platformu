package com.example.demo.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "departments")
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    // mappedBy = "department" ifadesi, User sınıfındaki "private Department department" alanına bakar.
    @OneToMany(mappedBy = "department") 
    private List<User> users;

    public Department() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public List<User> getUsers() { return users; }
    public void setUsers(List<User> users) { this.users = users; }
    
    public Long getId() { return id; }
}