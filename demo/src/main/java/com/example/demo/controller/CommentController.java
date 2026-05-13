package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Comment;
import com.example.demo.service.CommentService;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "*")
public class CommentController {
    @Autowired 
    private CommentService commentService;

    @GetMapping("/task/{taskId}")
    public List<Comment> getByTask(@PathVariable Long taskId) { 
        return commentService.getCommentsByTask(taskId); 
    }

    @PostMapping
    public Comment save(@RequestBody Comment comment) { 
        return commentService.saveComment(comment); 
    }
}