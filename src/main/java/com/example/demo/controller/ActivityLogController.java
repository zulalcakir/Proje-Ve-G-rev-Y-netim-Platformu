package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.ActivityLog;
import com.example.demo.service.ActivityLogService;

@RestController
@RequestMapping("/api/logs")
@CrossOrigin(origins = "*")
public class ActivityLogController {
    @Autowired 
    private ActivityLogService logService;

    @GetMapping
    public List<ActivityLog> getAll() { return logService.getAllLogs(); }
}