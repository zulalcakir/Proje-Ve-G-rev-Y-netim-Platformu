document.addEventListener('DOMContentLoaded', function() {
    // 1. Sayfa yüklendiğinde tabloları ve logları getir
    verileriYukle();
    loglariYukle();

    // 2. Her 30 saniyede bir logları arka planda otomatik yenile (Canlı akış için)
    setInterval(loglariYukle, 30000);
});

function verileriYukle() {
    // Tüm Kullanıcıları Getir ve Tabloya Bas
    fetch('http://localhost:8080/api/users')
    .then(res => res.json())
    .then(users => {
        document.getElementById('userCount').innerText = users.length;
        const tbody = document.getElementById('adminUserTable');
        tbody.innerHTML = '';

        users.forEach(user => {
            const roles = user.roles.map(r => r.name).join(', ');
            tbody.innerHTML += `
                <tr>
                    <td>${user.id}</td>
                    <td class="fw-bold">${user.username}</td>
                    <td>${user.email || 'Girilmemiş'}</td>
                    <td><span class="badge bg-warning text-dark">${roles}</span></td>
                    <td>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="status-${user.id}" checked>
                        </div>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-info me-1">Güncelle</button>
                        <button class="btn btn-sm btn-danger" onclick="kullaniciSil(${user.id})">Sil</button>
                    </td>
                </tr>
            `;
        });
    });

    // Tüm Projeleri Getir (İstatistik Kartı için)
    fetch('http://localhost:8080/api/projects')
    .then(res => res.json())
    .then(projects => {
        document.getElementById('projectCount').innerText = projects.length;
    });
}

// Hocanın istediği Sistem İşlem Loglarını çeken bölüm
function loglariYukle() {
    const logContainer = document.getElementById('systemLogs');
    
    fetch('http://localhost:8080/api/logs')
    .then(res => res.json())
    .then(logs => {
        if (logs.length === 0) {
            logContainer.innerHTML = '<div class="text-muted">Henüz bir hareket kaydedilmedi.</div>';
            return;
        }

        logContainer.innerHTML = ''; // Önceki içeriği temizle
        
        // En yeni logları en üstte göstermek için listeyi tersine çeviriyoruz (.reverse)
        logs.reverse().forEach(log => {
            const date = new Date(log.timestamp);
            const timeStr = date.toLocaleTimeString('tr-TR');
            
            // Logun türüne göre metin rengini ayarla (Silme kırmızı, Ekleme yeşil vb.)
            let textColor = 'text-white';
            if (log.action.includes('silindi') || log.action.includes('Hata')) textColor = 'text-danger';
            else if (log.action.includes('eklendi') || log.action.includes('yeni')) textColor = 'text-success';
            else if (log.action.includes('giriş')) textColor = 'text-info';

            logContainer.innerHTML += `
                <div class="${textColor} mb-1">
                    <span class="text-secondary">[${timeStr}]</span> 
                    <strong>${log.user ? log.user.username : 'SİSTEM'}:</strong> ${log.action}
                </div>
            `;
        });
    })
    .catch(err => {
        logContainer.innerHTML = '<div class="text-danger">Loglar yüklenirken sunucuya ulaşılamadı.</div>';
    });
}

// Silme (Delete) İşlemi
function kullaniciSil(id) {
    if(confirm('Bu kullanıcıyı tamamen silmek istediğinize emin misiniz?')) {
        fetch(`http://localhost:8080/api/users/${id}`, { method: 'DELETE' })
        .then(res => {
            if(res.ok) {
                // Silme başarılıysa listeyi ve logları anında yenile
                verileriYukle(); 
                loglariYukle();  
            } else {
                alert("Kullanıcı silinirken bir hata oluştu.");
            }
        })
        .catch(err => console.error("Silme hatası:", err));
    }
}