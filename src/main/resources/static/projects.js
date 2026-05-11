document.addEventListener('DOMContentLoaded', function() {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('jwtToken');
    
    // 1. GÜVENLİK KONTROLÜ
    if (!storedUser || !token || token === "null") {
        localStorage.clear();
        window.location.href = 'index.html';
        return;
    }

    const currentUser = JSON.parse(storedUser);

    // 2. ARAYÜZÜ KULLANICI BİLGİLERİYLE DOLDUR
    updateUserInterface(currentUser);

    // 3. PROJELERİ VE BİLDİRİMLERİ YÜKLE
    projelerimiYukle(currentUser.id, token);
    bildirimSayisiniYukle(currentUser.id, token);
});

/**
 * Üst bar ve yan menüdeki kullanıcı bilgilerini günceller
 */
function updateUserInterface(user) {
    const name = user.fullName || user.username;
    
    // HTML'deki ilgili alanları doldur
    if(document.getElementById('user-full-name'))
        document.getElementById('user-full-name').innerText = name;
    
    if(document.getElementById('user-avatar'))
        document.getElementById('user-avatar').innerText = name.charAt(0).toUpperCase();
    
    if(document.getElementById('user-role-label')) {
        const isAdmin = user.roles && user.roles.some(r => r.name === 'ROLE_ADMIN');
        document.getElementById('user-role-label').innerText = isAdmin ? 'Yönetici' : 'Üye';
    }
}

/**
 * Backend'den projeleri çeker ve Map yapısıyla birleştirir
 */
async function projelerimiYukle(userId, token) {
    const container = document.getElementById('projects-container');
    const headers = { 'Authorization': 'Bearer ' + token };

    try {
        // A) Yönettiğim Projeleri Çek
        const resProj = await fetch(`http://localhost:8080/api/projects/managed-by/${userId}`, { headers });
        const yonettigimProjeler = resProj.ok ? await resProj.json() : [];

        // B) Bana Atanan Görevleri Çek (Hangi projelerde katılımcıyım?)
        const resTask = await fetch(`http://localhost:8080/api/tasks/user/${userId}`, { headers });
        const banaAtananGorevler = resTask.ok ? await resTask.json() : [];

        // --- BİRLEŞTİRME VE BENZERSİZ HALE GETİRME ---
        const projeMap = new Map();
        
        // Önce yönetici olduklarımızı Map'e ekleyelim
        if(yonettigimProjeler) {
            yonettigimProjeler.forEach(p => {
                projeMap.set(p.id, { 
                    ...p, 
                    isManager: true, 
                    totalTasks: 0, 
                    completedTasks: 0 
                });
            });
        }

        // Sonra görevli olduğumuz projeleri ekleyelim/güncelleyelim
        if(banaAtananGorevler) {
            banaAtananGorevler.forEach(task => {
                if (task.project) {
                    const pId = task.project.id;
                    if (!projeMap.has(pId)) {
                        projeMap.set(pId, { 
                            ...task.project, 
                            isManager: false, 
                            totalTasks: 0, 
                            completedTasks: 0 
                        });
                    }
                    
                    const p = projeMap.get(pId);
                    p.totalTasks++;
                    if (task.status === 'TAMAMLANDI') p.completedTasks++;
                }
            });
        }

        // --- ARAYÜZE KARTLARI BASTIRMA ---
        container.innerHTML = '';
        
        if (projeMap.size === 0) {
            container.innerHTML = `
                <div class="col-12 text-center mt-5">
                    <i class="fas fa-folder-open fa-3x text-muted mb-3 opacity-25"></i>
                    <p class="text-muted">Henüz aktif bir projeniz bulunmuyor.</p>
                </div>`;
            return;
        }

        projeMap.forEach((p) => {
            const endDate = p.endDate ? new Date(p.endDate).toLocaleDateString('tr-TR') : '---';
            const managerName = p.manager ? (p.manager.fullName || p.manager.username) : 'Belirtilmedi';
            
            // Yüzdelik İlerleme Hesabı
            let progress = 0;
            if (p.totalTasks > 0) {
                progress = Math.round((p.completedTasks / p.totalTasks) * 100);
            }

            // Rozet Renkleri
            const roleBadge = p.isManager 
                ? '<span class="badge bg-info bg-opacity-25 text-info border border-info border-opacity-25 ms-2">Yönetici</span>' 
                : '<span class="badge bg-secondary bg-opacity-25 text-white-50 border border-secondary border-opacity-25 ms-2">Katılımcı</span>';

            container.innerHTML += `
                <div class="col-md-6 col-xl-4">
                    <div class="project-card d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <h5 class="text-white fw-bold m-0" style="letter-spacing:0.5px;">${p.name}</h5>
                            <i class="fas fa-rocket text-info" style="filter: drop-shadow(0 0 5px #00d2ff); opacity:0.8;"></i>
                        </div>
                        <p class="text-muted small flex-grow-1" style="font-size: 0.8rem; line-height: 1.5; min-height: 45px;">
                            ${p.description || 'Bu proje için henüz bir açıklama eklenmemiş.'}
                        </p>
                        
                        <div class="mt-4 border-top border-white border-opacity-10 pt-3">
                            <div class="d-flex justify-content-between align-items-center small text-white-50 mb-3">
                                <span><i class="fas fa-user-circle me-1 text-info"></i> ${managerName} ${roleBadge}</span>
                                <span class="small"><i class="far fa-calendar-alt me-1"></i> ${endDate}</span>
                            </div>
                            
                            <div class="d-flex justify-content-between small mb-1">
                                <span class="text-info fw-bold" style="font-size:0.7rem; text-transform:uppercase;">Tamamlanma</span>
                                <span class="text-white fw-bold">${progress}%</span>
                            </div>
                            <div class="progress-bar-custom">
                                <div class="progress-fill" style="width: ${progress}%;"></div>
                            </div>
                            <div class="text-end mt-2 text-muted" style="font-size: 0.65rem;">
                                <i class="fas fa-tasks me-1"></i> ${p.completedTasks} / ${p.totalTasks} Görev Bitti
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

    } catch (error) {
        console.error("Projeler yüklenemedi:", error);
        container.innerHTML = `<div class="col-12 text-center text-danger mt-5">Veri bağlantısı hatası! Lütfen sistemi kontrol edin.</div>`;
    }
}

/**
 * Bildirim zili için okunmamış bildirim sayısını çeker
 */
async function bildirimSayisiniYukle(userId, token) {
    const badge = document.getElementById('notif-badge');
    if(!badge) return;

    try {
        const res = await fetch(`http://localhost:8080/api/notifications/user/${userId}/unread-count`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const count = await res.json();
        
        if (count > 0) {
            badge.innerText = count;
            badge.classList.remove('d-none');
        } else {
            badge.classList.add('d-none');
        }
    } catch (err) {
        console.error("Bildirim sayısı çekilemedi");
    }
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}