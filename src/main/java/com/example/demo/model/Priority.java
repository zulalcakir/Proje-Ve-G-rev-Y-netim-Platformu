package com.example.demo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "priorities")
public class Priority {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String level; // Düşük, Orta, Yüksek
    private String colorCode; // Arayüzde göstermek için (#ff0000 vb.)

    // --- GETTER VE SETTER METOTLARI ---

    public Long getId() { 
        return id; 
    }
    
    public void setId(Long id) { 
        this.id = id; 
    }

    public String getLevel() { 
        return level; 
    }
    
    public void setLevel(String level) { 
        this.level = level; 
    }

    public String getColorCode() { 
        return colorCode; 
    }
    
    public void setColorCode(String colorCode) { 
        this.colorCode = colorCode; 
    }
}