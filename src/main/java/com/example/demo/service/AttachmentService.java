package com.example.demo.service;

import com.example.demo.model.Attachment;
import com.example.demo.model.Task;
import com.example.demo.repository.AttachmentRepository;
import com.example.demo.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Service
public class AttachmentService {

    @Autowired
    private AttachmentRepository attachmentRepository;

    @Autowired
    private TaskRepository taskRepository;

    // Dışarıdan (Arayüzden) gelen dosyayı yakalayıp veritabanına kaydeder
    public Attachment dosyaKaydet(MultipartFile file, Long taskId) throws Exception {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new Exception("Görev bulunamadı!"));

        Attachment attachment = new Attachment();
        attachment.setFileName(file.getOriginalFilename());
        attachment.setFileType(file.getContentType());
        attachment.setData(file.getBytes()); // Dosyanın içindeki veriyi al
        attachment.setTask(task);

        return attachmentRepository.save(attachment);
    }

    // İndirmek için tek bir dosyayı getirir
    public Attachment dosyaGetir(Long id) throws Exception {
        return attachmentRepository.findById(id)
                .orElseThrow(() -> new Exception("Dosya bulunamadı!"));
    }

    // Göreve ait tüm dosyaların listesini getirir
    public List<Attachment> goreveAitDosyalariGetir(Long taskId) {
        return attachmentRepository.findByTaskId(taskId);
    }
}