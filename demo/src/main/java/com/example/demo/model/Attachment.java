package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "attachments")
public class Attachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;
    private String fileType;

    /**
     * YENİ: Dosya yolunu (filePath) sildik, yerine doğrudan dosya verisini tutacak
     * data (byte[]) alanını ekledik. LONGBLOB sayesinde büyük boyutlu dosyalar veritabanına sığabilir.
     */
    @Lob
    @Column(columnDefinition="LONGBLOB")
    @JsonIgnore // JSON listelerinde kocaman verinin listeyi bozmasını engeller
    private byte[] data;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    @JsonIgnore // REST API çağrılarında sonsuz JSON döngüsünü engeller
    private Task task;

    // --- GETTER VE SETTER METOTLARI ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public byte[] getData() {
        return data;
    }

    public void setData(byte[] data) {
        this.data = data;
    }

    public Task getTask() {
        return task;
    }

    public void setTask(Task task) {
        this.task = task;
    }
}