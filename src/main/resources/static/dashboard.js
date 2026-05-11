// Grafik nesnelerini globalde tutalım (Tazelerken eskileri yok etmek için)
let userPieChart, userLineChart;

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
    await Promise.all([
        istatistikleriGuncelle(userId, token),
        gorevListesiniYukle(userId, token),
        sonLoglariYukle(userId, token),
        cezalariYukle(userId, token),
        bildirimleriYukle(userId, token)
    ]);
}

// --- GRAFİK MOTORLARI (YENİ) ---

function updateUserPieChart(completed, pending) {
    const ctx = document.getElementById('userTaskPieChart')?.getContext('2d');
    if (!ctx) return;
    if (userPieChart) userPieChart.destroy();

    userPieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Tamamlanan', 'Bekleyen'],
            datasets: [{
                data: [completed, pending],
                backgroundColor: ['#28a745', 'rgba(255, 255, 255, 0.05)'],
                borderColor: ['#28a745', 'rgba(255, 255, 255, 0.1)'],
                borderWidth: 1
            }]
        },
        options: {
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: { legend: { position: 'bottom', labels: { color: '#fff', font: { size: 10 } } } }
        }
    });
}

function updateUserLineChart(penalties) {
    const ctx = document.getElementById('userPenaltyLineChart')?.getContext('2d');
    if (!ctx || !penalties) return;

    const months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
    const monthlyData = new Array(12).fill(0);

    penalties.forEach(p => {
        const month = new Date(p.penaltyDate).getMonth();
        monthlyData[month] += p.penaltyScore;
    });

    if (userLineChart) userLineChart.destroy();

    userLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Ceza Puanım',
                data: monthlyData,
                borderColor: '#ff007f',
                backgroundColor: 'rgba(255, 0, 127, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#ff007f'
            }]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#fff', stepSize: 1 } },
                x: { grid: { display: false }, ticks: { color: '#fff' } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

// --- VERİ YÜKLEME FONKSİYONLARI ---

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

function handleResponse(res) {
    if (res.status === 401) {
        localStorage.clear();
        window.location.href = 'index.html';
        return Promise.reject("Oturum süresi doldu.");
    }
    if (!res.ok) return res.text().then(text => { throw new Error(text) });
    return res.status !== 204 ? res.json() : null;
}

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

        // GRAFİĞİ GÜNCELLE
        updateUserPieChart(tamamlananlar, bekleyenler);

    } catch (err) {
        console.error("İstatistik hatası:", err);
    }
}

async function cezalariYukle(userId, token) {
    const penaltyList = document.getElementById('penaltyList');
    const totalScoreElement = document.getElementById('totalPenaltyScore');
    if (!penaltyList || !totalScoreElement) return;

    try {
        const headers = { 'Authorization': 'Bearer ' + token };

        const resTotal = await fetch(`http://localhost:8080/api/penalties/user/${userId}/total`, { headers });
        const totalScore = await handleResponse(resTotal);
        totalScoreElement.innerText = (totalScore !== null && totalScore !== undefined) ? totalScore : 0;

        const resList = await fetch(`http://localhost:8080/api/penalties/user/${userId}`, { headers });
        const penalties = await handleResponse(resList);

        // GRAFİĞİ GÜNCELLE
        updateUserLineChart(penalties);

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

async function bildirimleriYukle(userId, token) {
    try {
        const res = await fetch(`http://localhost:8080/api/notifications/user/${userId}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const notifications = await handleResponse(res);
        
        const badge = document.getElementById('notif-badge');
        const list = document.getElementById('notification-list');
        
        if (!notifications || notifications.length === 0) {
            if (badge) badge.classList.add('d-none');
            if (list) list.innerHTML = '<p class="text-muted text-center mt-4 small"><i class="fas fa-mug-hot fa-2x opacity-25 mb-2"></i><br>Yeni bildiriminiz yok.</p>';
            return;
        }

        if (badge) {
            badge.innerText = notifications.length;
            badge.classList.remove('d-none');
        }

        if (list) {
            list.innerHTML = '';
            notifications.reverse().forEach(n => {
                list.innerHTML += `
                    <div class="mb-2 p-3 rounded-3 d-flex justify-content-between align-items-center" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(0,210,255,0.2);">
                        <div class="text-white small" style="font-size: 0.85rem;">
                            <i class="fas fa-info-circle text-info me-2"></i> ${n.message}
                        </div>
                        <button class="btn btn-sm btn-link text-white-50" onclick="bildirimOkundu(${n.id})" title="Okundu İşaretle">
                            <i class="fas fa-check"></i>
                        </button>
                    </div>
                `;
            });
        }
    } catch (err) { 
        console.error("Bildirimler yüklenemedi", err); 
    }
}

function bildirimOkundu(id) {
    const token = localStorage.getItem('jwtToken');
    fetch(`http://localhost:8080/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': 'Bearer ' + token }
    }).then(res => {
        if(res.ok) {
            const user = JSON.parse(localStorage.getItem('user'));
            bildirimleriYukle(user.id, token);
        }
    });
}

function markAllNotificationsAsRead() {
    const token = localStorage.getItem('jwtToken');
    const user = JSON.parse(localStorage.getItem('user'));
    fetch(`http://localhost:8080/api/notifications/user/${user.id}/read-all`, {
        method: 'PATCH',
        headers: { 'Authorization': 'Bearer ' + token }
    }).then(res => {
        if(res.ok) {
            bildirimleriYukle(user.id, token);
            closeNotificationModal();
        }
    });
}

function openNotificationModal() { document.getElementById('notificationModal').style.display = 'block'; }
function closeNotificationModal() { document.getElementById('notificationModal').style.display = 'none'; }

window.addEventListener('click', (e) => {
    const modal = document.getElementById('notificationModal');
    if (e.target == modal) modal.style.display = "none";
});

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}