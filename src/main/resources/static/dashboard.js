document.addEventListener('DOMContentLoaded', function() {
    // Sayfa yüklendiğinde tüm verileri paralel olarak çek
    istatistikleriGuncelle();
    gorevListesiniYukle();
    sonLoglariYukle();
});

// 1. Üstteki İstatistik Kartlarını Güncelle (Proje ve Görev Sayıları)
function istatistikleriGuncelle() {
    // Proje sayısını çek
    fetch('http://localhost:8080/api/projects')
        .then(res => res.json())
        .then(projeler => {
            document.getElementById('proje-sayisi').innerText = projeler.length;
        })
        .catch(err => console.error("Proje sayıları alınamadı:", err));

    // Görev istatistiklerini çek
    fetch('http://localhost:8080/api/tasks')
        .then(res => res.json())
        .then(gorevler => {
            document.getElementById('gorev-sayisi').innerText = gorevler.length;
            
            // "Tamamlanan" durumundaki görevleri filtrele
            const tamamlananlar = gorevler.filter(g => g.status === 'Tamamlandı' || g.status === 'Completed');
            document.getElementById('tamamlanan-sayisi').innerText = tamamlananlar.length;
        })
        .catch(err => console.error("Görev sayıları alınamadı:", err));
}

// 2. "Yaklaşan Görevler" Listesini Doldur
function gorevListesiniYukle() {
    const container = document.getElementById('task-list-container');

    fetch('http://localhost:8080/api/tasks')
        .then(res => res.json())
        .then(gorevler => {
            container.innerHTML = ''; // "Yükleniyor..." yazısını temizle

            if (gorevler.length === 0) {
                container.innerHTML = '<p class="text-muted">Henüz atanmış bir görev yok.</p>';
                return;
            }

            // Son eklenen 4 görevi göster
            gorevler.slice(-4).reverse().forEach(task => {
                const badgeClass = task.status === 'Tamamlandı' ? 'bg-success' : 'bg-info';
                
                container.innerHTML += `
                    <div class="task-item d-flex justify-content-between align-items-center p-3 mb-2 rounded">
                        <div>
                            <h6 class="text-white mb-1 fw-bold">${task.title}</h6>
                            <small class="subtitle">${task.description || 'Açıklama yok'}</small>
                        </div>
                        <span class="badge ${badgeClass} rounded-pill px-3 py-2">${task.status || 'Aktif'}</span>
                    </div>
                `;
            });
        });
}

// 3. "Sistem Hareketleri" (Log) Kısmını Doldur
function sonLoglariYukle() {
    const logBox = document.getElementById('recent-logs');

    fetch('http://localhost:8080/api/logs')
        .then(res => res.json())
        .then(logs => {
            logBox.innerHTML = ''; // Temizle

            if (logs.length === 0) {
                logBox.innerHTML = '<p class="text-muted" style="font-size: 0.8rem;">Henüz bir hareket kaydedilmedi.</p>';
                return;
            }

            // Son 6 logu en yeni üstte olacak şekilde göster
            logs.slice(-6).reverse().forEach(log => {
                const zaman = new Date(log.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                
                logBox.innerHTML += `
                    <div class="mb-2 p-2 border-bottom border-secondary" style="font-size: 0.85rem;">
                        <span class="text-info fw-bold">[${zaman}]</span>
                        <span class="text-white ms-2">${log.action}</span>
                    </div>
                `;
            });
        })
        .catch(err => {
            logBox.innerHTML = '<p class="text-danger">Loglar yüklenirken bir hata oluştu.</p>';
        });
}