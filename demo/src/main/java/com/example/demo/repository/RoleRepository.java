package com.example.demo.repository;

import com.example.demo.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    // Bu satırın olduğundan %100 emin ol, yoksa roller bulunamaz!
    Optional<Role> findByName(String name);
}