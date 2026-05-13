// AWS Linkini merkezi bir sabit olarak tanımlayalım
const BASE_URL = 'http://p-platform-env.eba-kcxaqihg.eu-west-1.elasticbeanstalk.com';

document.addEventListener('DOMContentLoaded', function() {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('jwtToken');
    
    // 1. GÜVENLİK VE OTURUM KONTROLÜ
    if (!storedUser || !token || token === "null") {
        localStorage.clear();
        window.location.href = 'index.html';
        return;
    }

    const currentUser = JSON.parse(storedUser);
    
    // 2. PROFİL BİLGİLERİNİ SENKRONİZE ET (Profilde isim değişirse burada da değişir)
    updateUI(currentUser);
    
    // 3. KANBAN AKIŞINI BAŞLAT
    gorevleriDagit(currentUser, token);
});

/**
 * Yan menü ve üst bar profil bilgilerini günceller
 */
function updateUI(user) {
    const name = user.fullName || user.username;
    if(document.getElementById('user-full-name'))
        document.getElementById('user-full-name').innerText = name;
    
    if(document.getElementById('user-avatar'))
        document.getElementById('user-avatar').innerText = name.charAt(0).toUpperCase();

    const isAdmin = user.roles && user.roles.some(r => r.name === 'ROLE_ADMIN');
    if(document.getElementById('user-role-label'))
        document.getElementById('user-role-label').innerText = isAdmin ? 'Yönetici' : 'Üye';
}

/**
 * Görevleri statülerine göre Kanban kolonlarına yerleştirir
 */
async function gorevleriDagit(user, token) {
    const columns = {
        'BEKLEMEDE': document.getElementById('col-BEKLEMEDE'),
        'DEVAM_EDIYOR': document.getElementById('col-DEVAM_EDIYOR'),
        'TAMAMLANDI': document.getElementById('col-TAMAMLANDI')
    };

    // Kolonları temizle ve yükleniyor simgesi koy
    Object.values(columns).forEach(col => {
        if(col) col.innerHTML = '<div class="text-center opacity-25 mt-4"><i class="fas fa-circle-notch fa-spin"></i></div>';
    });

    try {
        const isAdmin = user.roles && user.roles.some(role => role.name === 'ROLE_ADMIN');
        
        // Adminse tüm havuzu, üyeyse sadece kendi sorumluluklarını getirir (AWS üzerinden)
        const url = isAdmin 
            ? `${BASE_URL}/api/tasks` 
            : `${BASE_URL}/api/tasks/user/${user.id}`;

        const res = await fetch(url, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const tasks = await res.json();

        // Kolonları veriler için tamamen boşalt
        Object.values(columns).forEach(col => { if(col) col.innerHTML = ''; });

        tasks.reverse().forEach(task => {
            const col = columns[task.status] || columns['BEKLEMEDE'];
            if(!col) return;

            const date = task.dueDate ? new Date(task.dueDate).toLocaleDateString('tr-TR', {day:'2-digit', month:'short'}) : 'Süresiz';
            
            // Başkasına atanmış görev rozeti (Yönetici görüyorsa kimin yaptığını anlar)
            let assignedUserBadge = '';
            if (task.assignedTo && task.assignedTo.id !== user.id) {
                const personName = task.assignedTo.fullName || task.assignedTo.username;
                assignedUserBadge = `<span class="badge bg-warning bg-opacity-10 text-warning ms-2 border border-warning border-opacity-25" style="font-size: 0.6rem;"><i class="fas fa-user me-1"></i> ${personName}</span>`;
            }

            // Kategori ve Etiketler
            const categoryBadge = task.category ? `<span class="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 mb-2 me-1" style="font-size: 0.65rem;">${task.category.name}</span>` : '';
            let tagsHtml = '';
            if(task.tags && task.tags.length > 0) {
                task.tags.forEach(tag => {
                    tagsHtml += `<span class="badge border border-white border-opacity-10 text-white-50 mb-2 me-1" style="font-size: 0.65rem; background: rgba(255,255,255,0.03);">#${tag.name}</span>`;
                });
            }
            
            col.innerHTML += `
                <div class="task-card animate__animated animate__fadeInUp" onclick="openTaskDetailModal(${task.id})">
                    <div class="small text-info mb-2 d-flex align-items-center justify-content-between" style="font-size: 0.7rem; font-weight: 600;">
                        <span><i class="far fa-folder-open me-1"></i> ${task.project ? task.project.name : 'Genel'}</span>
                        ${assignedUserBadge}
                    </div>
                    
                    <div>${categoryBadge} ${tagsHtml}</div>

                    <h6 class="text-white fw-bold mb-2 mt-1" style="font-size: 0.95rem;">${task.title}</h6>
                    <p class="text-muted small mb-3" style="font-size:0.75rem; line-height:1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        ${task.description || 'Açıklama yok.'}
                    </p>

                    <div class="d-flex justify-content-between align-items-center border-top border-white border-opacity-10 pt-2 mt-2">
                        <span class="text-white-50" style="font-size:0.7rem"><i class="far fa-calendar-alt me-1 text-info"></i> ${date}</span>
                        <div class="btn-group">
                            ${task.status !== 'TAMAMLANDI' ? `
                                <button class="btn btn-sm btn-outline-info border-0 p-1 px-2" onclick="event.stopPropagation(); statusGuncelle(${task.id}, 'DEVAM_EDIYOR')" title="Çalışmaya Başla"><i class="fas fa-play"></i></button>
                                <button class="btn btn-sm btn-outline-success border-0 p-1 px-2" onclick="event.stopPropagation(); statusGuncelle(${task.id}, 'TAMAMLANDI')" title="Bitir"><i class="fas fa-check-double"></i></button>
                            ` : '<i class="fas fa-medal text-success" style="filter: drop-shadow(0 0 5px #28a745);"></i>'}
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (e) { console.error("Kanban yükleme hatası:", e); }
}

/**
 * Görev durumunu (Beklemede -> Devam -> Tamam) günceller
 */
function statusGuncelle(taskId, newStatus) {
    const token = localStorage.getItem('jwtToken');
    fetch(`${BASE_URL}/api/tasks/${taskId}/status?newStatus=${newStatus}`, {
        method: 'PATCH',
        headers: { 'Authorization': 'Bearer ' + token }
    }).then(res => {
        if(res.ok) {
            // Yumuşak bir yenileme
            const user = JSON.parse(localStorage.getItem('user'));
            gorevleriDagit(user, token);
        }
    });
}

// --- GÖREV DETAY, DOSYA VE YORUM İŞLEMLERİ ---

function openTaskDetailModal(taskId) {
    const modal = document.getElementById('taskDetailModal');
    modal.style.display = 'block';
    document.getElementById('comment-task-id').value = taskId;
    const token = localStorage.getItem('jwtToken');

    // Detayları Çek (AWS üzerinden)
    fetch(`${BASE_URL}/api/tasks/${taskId}`, { headers: { 'Authorization': 'Bearer ' + token } })
        .then(res => res.json())
        .then(task => {
            document.getElementById('modal-task-title').innerText = task.title;
            document.getElementById('modal-task-project').innerText = task.project ? task.project.name : 'Genel Proje';
            document.getElementById('modal-task-desc').innerText = task.description || 'Bu görev için detay girilmemiş.';
        });

    dosyalariGetir(taskId, token);
    yorumlariYukle(taskId, token);
}

function closeTaskDetailModal() {
    document.getElementById('taskDetailModal').style.display = 'none';
}

// --- DOSYA YÜKLEME VE İNDİRME MOTORU ---

function dosyaYukle() {
    const taskId = document.getElementById('comment-task-id').value;
    const fileInput = document.getElementById('task-file-input');
    const file = fileInput.files[0];
    const token = localStorage.getItem('jwtToken');

    if (!file) {
        alert("Dosya seçilmedi!");
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const container = document.getElementById('attachments-container');
    container.innerHTML = '<div class="text-info small w-100"><i class="fas fa-sync fa-spin me-2"></i>Dosya şifreleniyor ve yükleniyor...</div>';

    fetch(`${BASE_URL}/api/attachments/upload/${taskId}`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }, 
        body: formData
    })
    .then(async res => {
        if(res.ok) {
            fileInput.value = '';
            dosyalariGetir(taskId, token);
        } else {
            const err = await res.text();
            alert("Hata: " + err);
        }
    })
    .catch(() => alert("Bağlantı kesildi!"));
}

function dosyalariGetir(taskId, token) {
    const container = document.getElementById('attachments-container');
    container.innerHTML = '<span class="text-muted small">Taranıyor...</span>';

    fetch(`${BASE_URL}/api/attachments/task/${taskId}`, { 
        headers: { 'Authorization': 'Bearer ' + token } 
    })
    .then(res => res.json())
    .then(attachments => {
        container.innerHTML = '';
        if (attachments.length === 0) {
            container.innerHTML = '<span class="text-white-50 small opacity-50">Ekli dosya yok.</span>';
            return;
        }

        attachments.forEach(att => {
            container.innerHTML += `
                <button type="button" onclick="dosyaIndir(${att.id}, '${att.fileName}')" 
                   class="btn btn-sm btn-outline-light border-white border-opacity-10 rounded-pill mb-2 me-2 px-3" 
                   style="font-size: 0.7rem; background: rgba(255,255,255,0.03);">
                   <i class="fas fa-file-download me-1 text-info"></i> ${att.fileName}
                </button>
            `;
        });
    });
}

function dosyaIndir(attachmentId, fileName) {
    const token = localStorage.getItem('jwtToken');
    
    fetch(`${BASE_URL}/api/attachments/download/${attachmentId}`, {
        headers: { 'Authorization': 'Bearer ' + token } 
    })
    .then(res => {
        if (!res.ok) throw new Error("Dosya bulunamadı.");
        return res.blob();
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    })
    .catch(err => alert(err.message));
}

// --- YORUM VE SİSTEM NOTLARI ---

function yorumlariYukle(taskId, token) {
    const container = document.getElementById('comments-container');
    container.innerHTML = '<div class="text-center opacity-25 py-3"><i class="fas fa-comments fa-2x"></i></div>';

    fetch(`${BASE_URL}/api/comments/task/${taskId}`, { headers: { 'Authorization': 'Bearer ' + token } })
        .then(res => res.json())
        .then(comments => {
            container.innerHTML = '';
            if (comments.length === 0) {
                container.innerHTML = '<p class="text-muted small text-center mt-3">Henüz bir not bırakılmamış.</p>';
                return;
            }
            
            comments.forEach(c => {
                const date = new Date(c.createdAt).toLocaleString('tr-TR', {day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'});
                const name = c.user ? (c.user.fullName || c.user.username) : 'Sistem';
                container.innerHTML += `
                    <div class="mb-3 p-3 rounded-4" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);">
                        <div class="d-flex justify-content-between align-items-center mb-2 border-bottom border-white border-opacity-10 pb-2">
                            <strong class="text-info" style="font-size:0.75rem">${name}</strong>
                            <span class="text-white-50" style="font-size:0.65rem">${date}</span>
                        </div>
                        <p class="m-0 text-white-50" style="font-size:0.8rem; line-height:1.5;">${c.content}</p>
                    </div>
                `;
            });
            container.scrollTop = container.scrollHeight;
        });
}

// Yorum Gönderme Formu
document.getElementById('addCommentForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const taskId = document.getElementById('comment-task-id').value;
    const input = document.getElementById('new-comment-text');
    const token = localStorage.getItem('jwtToken');
    const user = JSON.parse(localStorage.getItem('user'));

    const data = {
        content: input.value,
        task: { id: parseInt(taskId) },
        user: { id: user.id }
    };

    fetch(`${BASE_URL}/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify(data)
    }).then(res => {
        if(res.ok) {
            input.value = '';
            yorumlariYukle(taskId, token);
        }
    });
});

// Yardımcı Kontroller (ESC ile kapatma vb.)
window.onclick = function(e) { if (e.target.classList.contains('modal')) closeTaskDetailModal(); }
document.addEventListener('keydown', e => { if (e.key === "Escape") closeTaskDetailModal(); });

function logout() { localStorage.clear(); window.location.href = 'index.html'; }