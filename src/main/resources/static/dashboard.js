// Sayfa yüklendiği an bu fonksiyon çalışacak
document.addEventListener('DOMContentLoaded', function() {
    gorevleriGetir();
});

function gorevleriGetir() {
    // 1. Arka taraftaki TaskController'a gidip görevleri istiyoruz
    fetch('http://localhost:8080/api/tasks')
    .then(cevap => cevap.json()) // Gelen veriyi JSON formatına çevir
    .then(gorevler => {
        // 2. Gelen verileri konsolda görelim (F12'ye basıp Console sekmesinden bakabilirsin)
        console.log("Veritabanından Gelen Gerçek Görevler: ", gorevler);
        
        // Şimdilik sadece kaç tane görev geldiğini ekrana yazdıralım
        // Eğer veritabanında görev varsa, sahte "12" yazısını güncelleyecek
        if(gorevler.length > 0) {
            // Not: HTML'de o 12 yazan yere id="bekleyen-sayisi" eklersen bu kod orayı değiştirir
            // document.getElementById('bekleyen-sayisi').innerText = gorevler.length;
        }
    })
    .catch(hata => {
        console.error("Görevler çekilirken hata oluştu: ", hata);
    });
}