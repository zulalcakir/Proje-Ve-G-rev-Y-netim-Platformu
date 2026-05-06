package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.ActivityLog;
import com.example.demo.model.User;
import com.example.demo.repository.ActivityLogRepository;

@Service
public class ActivityLogService {
    @Autowired private ActivityLogRepository logRepository;

    public void logAction(String action, User user) {
        ActivityLog log = new ActivityLog();
        log.setAction(action);
        log.setUser(user);
        logRepository.save(log);
    }

    public List<ActivityLog> getAllLogs() { return logRepository.findAll(); }
}