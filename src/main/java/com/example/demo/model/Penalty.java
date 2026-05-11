package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "penalties")
public class Penalty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "penalty_score")
    private int penaltyScore;

    /**
     * Veritabanındaki 'penalty_amount' kolonu ile eşleşmesi için eklendi.
     */
    @Column(name = "penalty_amount")
    private int penaltyAmount;

    @Column(name = "penalty_date")
    private LocalDateTime penaltyDate;

    private String reason;

    // Cezayı alan kullanıcıyı bağladık
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    /**
     * Cezaya sebep olan görevi bağladık.
     */
    @ManyToOne
    @JoinColumn(name = "task_id")
    private Task task;

    // --- GETTER VE SETTER METOTLARI ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getPenaltyScore() {
        return penaltyScore;
    }

    public void setPenaltyScore(int penaltyScore) {
        this.penaltyScore = penaltyScore;
    }

    public int getPenaltyAmount() {
        return penaltyAmount;
    }

    public void setPenaltyAmount(int penaltyAmount) {
        this.penaltyAmount = penaltyAmount;
    }

    public LocalDateTime getPenaltyDate() {
        return penaltyDate;
    }

    public void setPenaltyDate(LocalDateTime penaltyDate) {
        this.penaltyDate = penaltyDate;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Task getTask() {
        return task;
    }

    public void setTask(Task task) {
        this.task = task;
    }
}