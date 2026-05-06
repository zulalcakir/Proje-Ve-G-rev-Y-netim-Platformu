package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.Role;
import com.example.demo.repository.RoleRepository;

@Service
public class RoleService {
    @Autowired private RoleRepository roleRepository;
    public List<Role> getAllRoles() { return roleRepository.findAll(); }
    public Role saveRole(Role role) { return roleRepository.save(role); }
}