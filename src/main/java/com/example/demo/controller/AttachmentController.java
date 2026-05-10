package com.example.demo.controller;

import com.example.demo.model.Attachment;
import com.example.demo.service.AttachmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/attachments")
@CrossOrigin(origins = "*") // Frontend'den (Javascript) gelen isteklere izin verir
public class AttachmentController {

    @Autowired 
    private AttachmentService attachmentService;

    // 1. DOSYA YÜKLEME API'Sİ (Javascript'teki FormData'yı burada MultipartFile olarak yakalıyoruz)
    @PostMapping("/upload/{taskId}")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file, @PathVariable Long taskId) {
        try {
            Attachment attachment = attachmentService.dosyaKaydet(file, taskId);
            return ResponseEntity.ok("Dosya başarıyla yüklendi: " + attachment.getFileName());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Dosya yüklenirken hata oluştu: " + e.getMessage());
        }
    }

    // 2. GÖREVE AİT DOSYA LİSTESİNİ ÇEKME API'Sİ
    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<Attachment>> getTaskAttachments(@PathVariable Long taskId) {
        return ResponseEntity.ok(attachmentService.goreveAitDosyalariGetir(taskId));
    }

    // 3. DOSYA İNDİRME API'Sİ (Dosyanın byte verilerini tarayıcıya indirme formatında yollar)
    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable Long id) {
        try {
            Attachment attachment = attachmentService.dosyaGetir(id);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getFileName() + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, attachment.getFileType())
                    .body(attachment.getData());
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}