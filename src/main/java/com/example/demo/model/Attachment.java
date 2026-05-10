package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Entity
@Table(name = "attachments")
@Data
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
    @ToString.Exclude // Lombok'un konsola yazdırırken sonsuz döngüye girmesini engeller
    @EqualsAndHashCode.Exclude // Lombok'un karşılaştırma yaparken çökmesini engeller
    private Task task;
}