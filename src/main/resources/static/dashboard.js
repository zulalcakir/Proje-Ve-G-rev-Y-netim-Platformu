document.addEventListener('DOMContentLoaded', function() {
    // 1. Tarayıcı hafızasından kullanıcıyı ve token'ı al
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('jwtToken');
    
    // Güvenlik Kontrolü
    if (!storedUser || !token || token === "null") {
        localStorage.clear();
        window.location.href = 'index.html';
        return;
    }

    const currentUser = JSON.parse(storedUser);

    // 2. Arayüzü Kullanıcı Bilgileriyle Doldur
    updateUserInterface(currentUser);

    // 3. Verileri Çek
    verileriYukle(currentUser.id, token);

    // 4. Otomatik Yenileme (Her 60 saniyede bir verileri tazele)
    setInterval(() => {
        if (localStorage.getItem('jwtToken')) {
            verileriYukle(currentUser.id, token);
        }
    }, 60000);
});

// Merkezi Veri Yükleme Yöneticisi
async function verileriYukle(userId, token) {
    // Tüm yüklemeleri paralel başlatarak hızı artıralım
    await Promise.all([
        istatistikleriGuncelle(userId, token),
        gorevListesiniYukle(userId, token),
        sonLoglariYukle(userId, token),
        cezalariYukle(userId, token)
    ]);
}

// Arayüzdeki isim ve profil kısımlarını doldurur
function updateUserInterface(user) {
    const welcomeName = document.getElementById('welcome-name');
    const userFullName = document.getElementById('user-full-name');
    const avatar = document.getElementById('user-avatar');
    const roleLabel = document.getElementById('user-role-label');

    const name = user.fullName || user.username;

    if (welcomeName) welcomeName.innerText = name;
    if (userFullName) userFullName.innerText = name;
    if (avatar) avatar.innerText = name.charAt(0).toUpperCase();

    if (roleLabel) {
        const isAdmin = user.roles && user.roles.some(r => r.name === 'ROLE_ADMIN');
        roleLabel.innerText = isAdmin ? 'Yönetici' : 'Üye';
    }
}

// Merkezi Yanıt Yöneticisi
function handleResponse(res) {
    if (res.status === 401) {
        localStorage.clear();
        window.location.href = 'index.html';
        return Promise.reject("Oturum süresi doldu.");
    }
    if (!res.ok) return res.text().then(text => { throw new Error(text) });
    return res.status !== 204 ? res.json() : null;
}

// 1. İstatistikleri Güncelle
async function istatistikleriGuncelle(userId, token) {
    try {
        const headers = { 'Authorization': 'Bearer ' + token };
        const [resProj, resTask] = await Promise.all([
            fetch(`http://localhost:8080/api/projects/managed-by/${userId}`, { headers }),
            fetch(`http://localhost:8080/api/tasks/user/${userId}`, { headers })
        ]);

        const yonettigimProjeler = await handleResponse(resProj);
        const banaAtananGorevler = await handleResponse(resTask);

        const projeIDleri = new Set();
        if (yonettigimProjeler) yonettigimProjeler.forEach(p => projeIDleri.add(p.id));
        if (banaAtananGorevler) {
            banaAtananGorevler.forEach(g => {
                if (g.project) projeIDleri.add(g.project.id);
            });
        }

        document.getElementById('proje-sayisi').innerText = projeIDleri.size;
        const bekleyenler = banaAtananGorevler ? banaAtananGorevler.filter(g => g.status !== 'TAMAMLANDI').length : 0;
        const tamamlananlar = banaAtananGorevler ? banaAtananGorevler.filter(g => g.status === 'TAMAMLANDI').length : 0;
        
        document.getElementById('gorev-sayisi').innerText = bekleyenler;
        document.getElementById('tamamlanan-sayisi').innerText = tamamlananlar;
    } catch (err) {
        console.error("İstatistik hatası:", err);
    }
}

// 2. Ceza Verilerini Yükle - DEBUG MODU EKLENDİ
async function cezalariYukle(userId, token) {
    const penaltyList = document.getElementById('penaltyList');
    const totalScoreElement = document.getElementById('totalPenaltyScore');
    if (!penaltyList || !totalScoreElement) return;

    try {
        const headers = { 'Authorization': 'Bearer ' + token };

        // A. Toplam Puanı Çek
        const resTotal = await fetch(`http://localhost:8080/api/penalties/user/${userId}/total`, { headers });
        const totalScore = await handleResponse(resTotal);
        totalScoreElement.innerText = (totalScore !== null && totalScore !== undefined) ? totalScore : 0;

        // B. Ceza Listesini Çek
        const resList = await fetch(`http://localhost:8080/api/penalties/user/${userId}`, { headers });
        const penalties = await handleResponse(resList);

        console.log("Backend'den gelen cezalar:", penalties); // DEBUG: Gelen veriyi konsolda kontrol et

        penaltyList.innerHTML = '';

        if (!penalties || penalties.length === 0) {
            penaltyList.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted small">Henüz ceza kaydınız bulunmuyor.</td></tr>';
            return;
        }

        penalties.reverse().forEach(p => {
            const date = p.penaltyDate ? new Date(p.penaltyDate).toLocaleString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '---';
            const taskTitle = p.task ? p.task.title : 'Genel Sistem';

            penaltyList.innerHTML += `
                <tr class="task-row" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td class="py-3 fw-bold text-white">${taskTitle}</td>
                    <td class="text-white-50">${p.reason || 'Sebep belirtilmedi'}</td>
                    <td><span class="badge bg-danger bg-opacity-25 text-danger">-${p.penaltyScore} Puan</span></td>
                    <td class="small text-white-50">${date}</td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Ceza listesi yüklenemedi:", err);
    }
}

// 3. Tabloya Görevleri Yükle
async function gorevListesiniYukle(userId, token) {
    const taskList = document.getElementById('task-list');
    const noTaskMsg = document.getElementById('no-task-message');
    if (!taskList) return;

    try {
        const res = await fetch(`http://localhost:8080/api/tasks/user/${userId}`, { 
            headers: { 'Authorization': 'Bearer ' + token } 
        });
        const gorevler = await handleResponse(res);

        taskList.innerHTML = '';
        if (!gorevler || gorevler.length === 0) {
            if (noTaskMsg) noTaskMsg.classList.remove('d-none');
            return;
        }
        if (noTaskMsg) noTaskMsg.classList.add('d-none');

        gorevler.reverse().forEach(task => {
            const date = task.dueDate ? new Date(task.dueDate).toLocaleString('tr-TR', { day: '2-digit', month: 'short' }) : '---';
            const projectName = task.project ? task.project.name : 'Genel';
            
            taskList.innerHTML += `
                <tr class="task-row" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td class="py-3">
                        <div class="fw-bold text-white">${task.title}</div>
                        <div class="text-muted small" style="font-size:0.7rem">${task.description || ''}</div>
                    </td>
                    <td><span class="text-info opacity-75">${projectName}</span></td>
                    <td class="small text-white-50">${date}</td>
                    <td>${getStatusBadge(task.status)}</td>
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
    } catch (err) {
        console.error("Görev listesi yüklenemedi:", err);
    }
}

// Durum Güncelleme
function updateStatus(taskId, newStatus) {
    const token = localStorage.getItem('jwtToken');
    const user = JSON.parse(localStorage.getItem('user'));
    
    fetch(`http://localhost:8080/api/tasks/${taskId}/status?newStatus=${newStatus}`, {
        method: 'PATCH',
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(res => {
        if(res.ok) {
            verileriYukle(user.id, token);
        }
    })
    .catch(err => alert("Durum güncellenirken hata oluştu."));
}

function getStatusBadge(status) {
    switch(status) {
        case 'TAMAMLANDI': return '<span class="badge bg-success bg-opacity-25 text-success small" style="font-size:0.6rem">TAMAMLANDI</span>';
        case 'BEKLEMEDE': return '<span class="badge bg-warning bg-opacity-25 text-warning small" style="font-size:0.6rem">BEKLEMEDE</span>';
        case 'DEVAM_EDIYOR': return '<span class="badge bg-info bg-opacity-25 text-info small" style="font-size:0.6rem">DEVAM EDİYOR</span>';
        default: return `<span class="badge bg-secondary bg-opacity-25 text-white small" style="font-size:0.6rem">${status}</span>`;
    }
}

// 4. Son İşlem Loglarını Yükle
async function sonLoglariYukle(userId, token) {
    const logBox = document.getElementById('recent-logs');
    if (!logBox) return;

    try {
        const res = await fetch('http://localhost:8080/api/logs', { 
            headers: { 'Authorization': 'Bearer ' + token } 
        });
        const logs = await handleResponse(res);

        logBox.innerHTML = '';
        const benimLoglarim = logs ? logs.filter(log => log.user && log.user.id === userId) : [];

        if (benimLoglarim.length === 0) {
            logBox.innerHTML = '<p class="text-muted text-center mt-4 small">Henüz bir hareket yok.</p>';
            return;
        }

        benimLoglarim.slice(-8).reverse().forEach(log => {
            const zaman = new Date(log.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
            logBox.innerHTML += `
                <div class="mb-2 small" style="font-size:0.75rem">
                    <span class="text-info">[${zaman}]</span>
                    <span class="text-white-50 ms-1">${log.action}</span>
                </div>
            `;
        });
    } catch (err) {
        console.error("Loglar yüklenemedi.");
    }
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}