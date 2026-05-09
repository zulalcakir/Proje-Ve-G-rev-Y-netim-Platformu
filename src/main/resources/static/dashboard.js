document.addEventListener('DOMContentLoaded', function() {
    // 1. Tarayıcı hafızasından giriş yapan kullanıcıyı ve token'ı al
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('jwtToken');
    
    // Güvenlik Kontrolü
    if (!storedUser || !token) {
        window.location.href = 'index.html';
        return;
    }

    const currentUser = JSON.parse(storedUser);

    // 2. Arayüzü Kullanıcı Bilgileriyle Doldur
    updateUserInterface(currentUser);

    // 3. Verileri Yeni API Uçlarından Çek
    istatistikleriGuncelle(currentUser.id, token);
    gorevListesiniYukle(currentUser.id, token);
    sonLoglariYukle(currentUser.id, token);
});

// Arayüzdeki isim, profil ve avatar kısımlarını dolduran fonksiyon
function updateUserInterface(user) {
    // Hoş geldin mesajı ve sol profil alanı
    document.getElementById('welcome-name').innerText = user.fullName || user.username;
    document.getElementById('user-full-name').innerText = user.fullName || user.username;
    
    // Avatar baş harfi
    const avatar = document.getElementById('user-avatar');
    if (avatar) {
        avatar.innerText = (user.fullName || user.username).charAt(0).toUpperCase();
    }

    // Rol etiketini belirle
    const roleLabel = document.getElementById('user-role-label');
    if (roleLabel) {
        const isAdmin = user.roles && user.roles.some(r => r.name === 'ROLE_ADMIN');
        roleLabel.innerText = isAdmin ? 'Yönetici' : 'Üye';
    }
}

// Ortak Header Hazırlayıcı
function getAuthHeaders(token) {
    return {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
    };
}

// 1. İstatistikleri Güncelle (Optimize Edilmiş)
function istatistikleriGuncelle(userId, token) {
    // Proje sayısı (Yine filtreleme ile, ilerde buna da özel API yazılabilir)
    fetch('http://localhost:8080/api/projects', { headers: getAuthHeaders(token) })
        .then(res => res.json())
        .then(projeler => {
            document.getElementById('proje-sayisi').innerText = projeler.length;
        });

    // Görev Sayıları (Backend'deki kullanıcıya özel uçtan çekiliyor)
    fetch(`http://localhost:8080/api/tasks/user/${userId}`, { headers: getAuthHeaders(token) })
        .then(res => res.json())
        .then(gorevler => {
            const bekleyenler = gorevler.filter(g => g.status !== 'TAMAMLANDI');
            const tamamlananlar = gorevler.filter(g => g.status === 'TAMAMLANDI');
            
            document.getElementById('gorev-sayisi').innerText = bekleyenler.length;
            document.getElementById('tamamlanan-sayisi').innerText = tamamlananlar.length;
        });
}

// 2. Tabloya Görevleri Yükle (Yeni API Ucu: /api/tasks/user/{userId})
function gorevListesiniYukle(userId, token) {
    const taskList = document.getElementById('task-list');

    fetch(`http://localhost:8080/api/tasks/user/${userId}`, { headers: getAuthHeaders(token) })
        .then(res => res.json())
        .then(gorevler => {
            taskList.innerHTML = '';

            if (gorevler.length === 0) {
                document.getElementById('no-task-message').classList.remove('d-none');
                return;
            }

            gorevler.slice(-6).reverse().forEach(task => {
                const statusBadge = getStatusBadge(task.status);
                const date = task.dueDate ? new Date(task.dueDate).toLocaleString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Belirtilmedi';
                
                taskList.innerHTML += `
                    <tr class="task-row" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td class="py-3">
                            <div class="fw-bold text-white">${task.title}</div>
                            <div class="text-muted small">${task.description || ''}</div>
                        </td>
                        <td><span class="text-info opacity-75">${task.project ? task.project.name : '-'}</span></td>
                        <td class="small text-white-50">${date}</td>
                        <td>${statusBadge}</td>
                        <td class="text-center">
                            ${task.status !== 'TAMAMLANDI' ? 
                                `<button class="btn btn-sm btn-outline-success border-0" onclick="updateStatus(${task.id}, 'TAMAMLANDI')">
                                    <i class="fas fa-check"></i>
                                 </button>` : 
                                `<i class="fas fa-check-circle text-success"></i>`
                            }
                        </td>
                    </tr>
                `;
            });
        });
}

// Durum Güncelleme (Yeni PATCH API Ucu)
function updateStatus(taskId, newStatus) {
    const token = localStorage.getItem('jwtToken');
    
    fetch(`http://localhost:8080/api/tasks/${taskId}/status?newStatus=${newStatus}`, {
        method: 'PATCH',
        headers: getAuthHeaders(token)
    })
    .then(response => {
        if(response.ok) {
            // Sayfayı yenilemeden veriyi tazele
            const user = JSON.parse(localStorage.getItem('user'));
            istatistikleriGuncelle(user.id, token);
            gorevListesiniYukle(user.id, token);
            sonLoglariYukle(user.id, token);
        }
    });
}

// Durum badge'i için yardımcı fonksiyon
function getStatusBadge(status) {
    switch(status) {
        case 'TAMAMLANDI': return '<span class="badge-status bg-success bg-opacity-25 text-success border border-success border-opacity-25">TAMAMLANDI</span>';
        case 'DEVAM_EDIYOR': return '<span class="badge-status bg-info bg-opacity-25 text-info border border-info border-opacity-25">DEVAM EDİYOR</span>';
        case 'BEKLEMEDE': return '<span class="badge-status bg-warning bg-opacity-25 text-warning border border-warning border-opacity-25">BEKLEMEDE</span>';
        default: return `<span class="badge-status bg-secondary opacity-50">${status}</span>`;
    }
}

// 3. Son İşlem Loglarını Yükle
function sonLoglariYukle(userId, token) {
    const logBox = document.getElementById('recent-logs');

    fetch('http://localhost:8080/api/logs', { headers: getAuthHeaders(token) })
        .then(res => res.json())
        .then(logs => {
            logBox.innerHTML = '';
            const benimLoglarim = logs.filter(log => log.user && log.user.id === userId);

            if (benimLoglarim.length === 0) {
                logBox.innerHTML = '<p class="text-muted text-center mt-4 small">Henüz bir hareket yok.</p>';
                return;
            }

            benimLoglarim.slice(-10).reverse().forEach(log => {
                const zaman = new Date(log.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                logBox.innerHTML += `
                    <div class="activity-item">
                        <span class="text-info fw-bold">[${zaman}]</span>
                        <span class="text-white-50 ms-2">${log.action}</span>
                    </div>
                `;
            });
        });
}

// Çıkış Fonksiyonu
function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}