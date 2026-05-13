package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.Department;
import com.example.demo.repository.DepartmentRepository;

@Service
public class DepartmentService {
    @Autowired private DepartmentRepository departmentRepository;
    public List<Department> getAllDepartments() { return departmentRepository.findAll(); }
    public Department saveDepartment(Department department) { return departmentRepository.save(department); }
}