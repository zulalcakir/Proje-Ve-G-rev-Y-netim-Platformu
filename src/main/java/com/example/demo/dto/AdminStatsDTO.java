package com.example.demo.dto;

public class AdminStatsDTO {
    private long totalUsers;
    private long totalProjects;
    private long totalTasks;
    private long completedTasks;

    public AdminStatsDTO(long totalUsers, long totalProjects, long totalTasks, long completedTasks) {
        this.totalUsers = totalUsers;
        this.totalProjects = totalProjects;
        this.totalTasks = totalTasks;
        this.completedTasks = completedTasks;
    }

    // Getter ve Setterlar
    public long getTotalUsers() { return totalUsers; }
    public long getTotalProjects() { return totalProjects; }
    public long getTotalTasks() { return totalTasks; }
    public long getCompletedTasks() { return completedTasks; }
}