package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Attachment;
import com.example.demo.service.AttachmentService;

@RestController
@RequestMapping("/api/attachments")
@CrossOrigin(origins = "*")
public class AttachmentController {
    @Autowired 
    private AttachmentService attachmentService;

    @PostMapping
    public Attachment save(@RequestBody Attachment attachment) { 
        return attachmentService.saveAttachment(attachment); 
    }
}