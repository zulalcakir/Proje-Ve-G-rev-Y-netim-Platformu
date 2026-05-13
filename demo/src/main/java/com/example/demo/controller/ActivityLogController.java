package com.example.demo.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.demo.model.ActivityLog;
import com.example.demo.service.ActivityLogService;

@RestController
@RequestMapping("/api/logs")
@CrossOrigin(origins = "*")
public class ActivityLogController {

    @Autowired 
    private ActivityLogService logService;

    @GetMapping
    public List<ActivityLog> getAll() { 
        return logService.getAllLogs(); 
    }

    @DeleteMapping("/clear")
    public ResponseEntity<String> clearLogs() {
        // Service içindeki metot ismiyle tam eşleşmeli: deleteAllLogs
        logService.deleteAllLogs(); 
        return ResponseEntity.ok("Loglar temizlendi.");
    }
}