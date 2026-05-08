document.addEventListener('DOMContentLoaded', function() {
    // 1. Tarayıcı hafızasından giriş yapan kullanıcıyı al
    const storedUser = localStorage.getItem('user');
    
    if (!storedUser) {
        // Eğer giriş yapılmamışsa login sayfasına geri gönder
        window.location.href = 'index.html';
        return;
    }

    const currentUser = JSON.parse(storedUser);

    // 2. Arayüzdeki isim alanlarını güncelle
    updateUserInterface(currentUser);

    // 3. Verileri SADECE bu kullanıcıya özel olarak çek/filtrele
    istatistikleriGuncelle(currentUser.id);
    gorevListesiniYukle(currentUser.id);
    sonLoglariYukle(currentUser.id);
});

// Arayüzdeki isim ve profil kısımlarını dolduran fonksiyon
function updateUserInterface(user) {
    // Hoş geldin mesajı
    const welcomeTitle = document.querySelector('.header-section h2');
    if (welcomeTitle) {
        welcomeTitle.innerHTML = `Hoş Geldin, ${user.fullName || user.username}! 👋`;
    }

    // Sol alttaki profil ismi
    const profileName = document.querySelector('.profile-section p.fw-bold');
    if (profileName) {
        profileName.innerText = user.fullName || user.username;
    }
}

// 1. İstatistikleri SADECE Kullanıcıya Göre Filtrele
function istatistikleriGuncelle(userId) {
    // Sadece benim projelerimi say
    fetch('http://localhost:8080/api/projects')
        .then(res => res.json())
        .then(projeler => {
            // Eğer backend'de 'owner' veya 'createdBy' varsa ona göre filtrele
            const benimProjelerim = projeler.filter(p => p.ownerId === userId || !p.ownerId); // Geçici mantık
            document.getElementById('proje-sayisi').innerText = benimProjelerim.length;
        })
        .catch(err => console.error("Proje sayıları alınamadı:", err));

    // Sadece benim görevlerimi say
    fetch('http://localhost:8080/api/tasks')
        .then(res => res.json())
        .then(gorevler => {
            // Sadece bu kullanıcıya atanmış görevler
            const benimGorevlerim = gorevler.filter(g => g.assignedUserId === userId);
            document.getElementById('gorev-sayisi').innerText = benimGorevlerim.length;
            
            const tamamlananlar = benimGorevlerim.filter(g => g.status === 'Tamamlandı' || g.status === 'Completed');
            document.getElementById('tamamlanan-sayisi').innerText = tamamlananlar.length;
        })
        .catch(err => console.error("Görev sayıları alınamadı:", err));
}

// 2. SADECE Kullanıcının Kendi Görevlerini Yükle
function gorevListesiniYukle(userId) {
    const container = document.getElementById('task-list-container');

    fetch('http://localhost:8080/api/tasks')
        .then(res => res.json())
        .then(gorevler => {
            container.innerHTML = '';

            const benimGorevlerim = gorevler.filter(g => g.assignedUserId === userId);

            if (benimGorevlerim.length === 0) {
                container.innerHTML = '<p class="text-muted text-center mt-5">Henüz sana atanmış bir görev yok.</p>';
                return;
            }

            benimGorevlerim.slice(-4).reverse().forEach(task => {
                const badgeClass = task.status === 'Tamamlandı' ? 'bg-success' : 'bg-info';
                
                container.innerHTML += `
                    <div class="stat-box d-flex justify-content-between align-items-center p-3 mb-2 rounded-3">
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

// 3. SADECE Kullanıcının Kendi İşlem Loglarını Yükle
function sonLoglariYukle(userId) {
    const logBox = document.getElementById('recent-logs');

    fetch('http://localhost:8080/api/logs')
        .then(res => res.json())
        .then(logs => {
            logBox.innerHTML = '';

            // KRİTİK FİLTRE: Sadece bu kullanıcıya ait loglar
            const benimLoglarim = logs.filter(log => log.user && log.user.id === userId);

            if (benimLoglarim.length === 0) {
                logBox.innerHTML = '<p class="text-muted" style="font-size: 0.8rem;">Henüz bir hareketin yok.</p>';
                return;
            }

            benimLoglarim.slice(-6).reverse().forEach(log => {
                const zaman = new Date(log.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                
                logBox.innerHTML += `
                    <div class="mb-2 p-2 border-bottom border-white border-opacity-10" style="font-size: 0.85rem;">
                        <span class="text-info fw-bold">[${zaman}]</span>
                        <span class="text-white-50 ms-2">${log.action}</span>
                    </div>
                `;
            });
        })
        .catch(err => {
            logBox.innerHTML = '<p class="text-danger">Loglar yüklenirken bir hata oluştu.</p>';
        });
}