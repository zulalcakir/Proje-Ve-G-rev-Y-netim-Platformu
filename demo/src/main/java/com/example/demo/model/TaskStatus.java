package com.example.demo.model;

public enum TaskStatus {
    BEKLEMEDE,      // Görev oluşturuldu ama henüz kimse başlamadı
    DEVAM_EDIYOR,   // Üzerinde çalışılıyor
    TEST_ASAMASINDA, // Yazılım bitti, kontrol ediliyor
    TAMAMLANDI,     // Görev başarıyla kapandı
    IPTAL_EDILDI    // Görevden vazgeçildi
}