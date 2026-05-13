package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Priority;
import com.example.demo.service.PriorityService;

@RestController
@RequestMapping("/api/priorities")
@CrossOrigin(origins = "*")
public class PriorityController {
    @Autowired 
    private PriorityService priorityService;

    @GetMapping
    public List<Priority> getAll() { return priorityService.getAllPriorities(); }
}