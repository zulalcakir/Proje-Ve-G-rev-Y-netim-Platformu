package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "penalties")
@Data // Getter, Setter ve ToString'i otomatik halleder
public class Penalty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "penalty_score")
    private int penaltyScore;

    @Column(name = "penalty_date")
    private LocalDateTime penaltyDate;

    private String reason;

    // Cezayı alan kullanıcıyı bağladık
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // Cezaya sebep olan görevi bağladık
    @ManyToOne
    @JoinColumn(name = "task_id")
    private Task task;
}