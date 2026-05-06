package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.Attachment;
import com.example.demo.repository.AttachmentRepository;

@Service
public class AttachmentService {
    @Autowired private AttachmentRepository attachmentRepository;
    public Attachment saveAttachment(Attachment attachment) { return attachmentRepository.save(attachment); }
}