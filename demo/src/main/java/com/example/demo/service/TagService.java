package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.Tag;
import com.example.demo.repository.TagRepository;

@Service
public class TagService {
    @Autowired private TagRepository tagRepository;
    public List<Tag> getAllTags() { return tagRepository.findAll(); }
    public Tag saveTag(Tag tag) { return tagRepository.save(tag); }
}