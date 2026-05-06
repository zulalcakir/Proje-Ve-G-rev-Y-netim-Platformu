package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.Priority;
import com.example.demo.repository.PriorityRepository;

@Service
public class PriorityService {
    @Autowired private PriorityRepository priorityRepository;
    public List<Priority> getAllPriorities() { return priorityRepository.findAll(); }
}