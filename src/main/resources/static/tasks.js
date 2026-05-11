document.addEventListener('DOMContentLoaded', function() {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('jwtToken');
    
    if (!storedUser || !token || token === "null") {
        window.location.href = 'index.html';
        return;
    }

    const currentUser = JSON.parse(storedUser);
    updateUI(currentUser);
    
    // DİKKAT: Artık sadece userId'yi değil, Admin ve Yönetici kontrolü yapabilmek için 
    // currentUser nesnesinin tamamını fonksiyona gönderiyoruz.
    gorevleriDagit(currentUser, token);
});

function updateUI(user) {
    document.getElementById('user-full-name').innerText = user.fullName || user.username;
    document.getElementById('user-avatar').innerText = (user.fullName || user.username).charAt(0).toUpperCase();
}

async function gorevleriDagit(user, token) {
    const columns = {
        'BEKLEMEDE': document.getElementById('col-BEKLEMEDE'),
        'DEVAM_EDIYOR': document.getElementById('col-DEVAM_EDIYOR'),
        'TAMAMLANDI': document.getElementById('col-TAMAMLANDI')
    };

    // Kolonları temizle
    Object.values(columns).forEach(col => col.innerHTML = '');

    try {
        // 1. KONTROL: Giriş yapan kişi Sistem Yöneticisi (Admin) mi?
        const isAdmin = user.roles && user.roles.some(role => role.name === 'ROLE_ADMIN');
        
        // 2. AKILLI URL: Adminse tüm görevleri getir (/api/tasks), 
        // Değilse (normal üyeyse) kendisine atanan VEYA yönettiği projelerdeki görevleri getir
        const url = isAdmin 
            ? `http://localhost:8080/api/tasks` 
            : `http://localhost:8080/api/tasks/user/${user.id}`;

        const res = await fetch(url, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const tasks = await res.json();

        tasks.forEach(task => {
            const col = columns[task.status] || columns['BEKLEMEDE'];
            const date = task.dueDate ? new Date(task.dueDate).toLocaleDateString('tr-TR') : 'Süresiz';
            
            // --- AKILLI ROZET SİSTEMİ ---
            // Eğer görev başkasına atanmışsa ama benim panomdaysa (demek ki ben yöneticiyim veya adminim)
            let assignedUserBadge = '';
            if (task.assignedTo && task.assignedTo.id !== user.id) {
                const personName = task.assignedTo.fullName || task.assignedTo.username;
                assignedUserBadge = `<span class="badge bg-warning text-dark ms-2 fw-bold" style="font-size: 0.65rem;"><i class="fas fa-user-tag me-1"></i> ${personName}</span>`;
            }

            // --- YENİ EKLENDİ: KATEGORİ VE ETİKET ROZETLERİ ---
            const categoryBadge = task.category ? `<span class="badge bg-secondary mb-2 me-1" style="font-size: 0.65rem;">${task.category.name}</span>` : '';
            let tagsHtml = '';
            if(task.tags && task.tags.length > 0) {
                task.tags.forEach(tag => {
                    tagsHtml += `<span class="badge border border-info text-info mb-2 me-1" style="background: rgba(0,210,255,0.1); font-size: 0.65rem;">#${tag.name}</span>`;
                });
            }
            
            // DİKKAT: Görev kartına tıklanabilirlik özelliği (Modal) eklendi!
            col.innerHTML += `
                <div class="task-card" onclick="openTaskDetailModal(${task.id})">
                    <div class="small text-info mb-2 d-flex align-items-start justify-content-between">
                        <span>${task.project ? task.project.name : 'Genel'}</span>
                        ${assignedUserBadge}
                    </div>
                    
                    <div>${categoryBadge} ${tagsHtml}</div>

                    <h6 class="text-white fw-bold mb-2 mt-1">${task.title}</h6>
                    <p class="text-muted small mb-3" style="font-size:0.75rem">${task.description || ''}</p>
                    <div class="d-flex justify-content-between align-items-center border-top border-white border-opacity-10 pt-2">
                        <span class="text-white-50" style="font-size:0.7rem"><i class="far fa-calendar me-1"></i> ${date}</span>
                        <div class="btn-group">
                            ${task.status !== 'TAMAMLANDI' ? `
                                <button class="btn btn-sm btn-outline-light border-0" onclick="event.stopPropagation(); statusGuncelle(${task.id}, 'DEVAM_EDIYOR')"><i class="fas fa-play text-info"></i></button>
                                <button class="btn btn-sm btn-outline-light border-0" onclick="event.stopPropagation(); statusGuncelle(${task.id}, 'TAMAMLANDI')"><i class="fas fa-check text-success"></i></button>
                            ` : '<i class="fas fa-check-double text-success" onclick="event.stopPropagation()"></i>'}
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (e) { console.error("Yükleme hatası:", e); }
}

function statusGuncelle(taskId, newStatus) {
    const token = localStorage.getItem('jwtToken');
    fetch(`http://localhost:8080/api/tasks/${taskId}/status?newStatus=${newStatus}`, {
        method: 'PATCH',
        headers: { 'Authorization': 'Bearer ' + token }
    }).then(res => {
        if(res.ok) location.reload();
    });
}

// --- GÖREV DETAY, DOSYA VE YORUM İŞLEMLERİ ---

function openTaskDetailModal(taskId) {
    document.getElementById('taskDetailModal').style.display = 'block';
    document.getElementById('comment-task-id').value = taskId;
    const token = localStorage.getItem('jwtToken');

    // 1. Tıklanan Görevin Detaylarını Çek
    fetch(`http://localhost:8080/api/tasks/${taskId}`, { headers: { 'Authorization': 'Bearer ' + token } })
        .then(res => res.json())
        .then(task => {
            document.getElementById('modal-task-title').innerText = task.title;
            document.getElementById('modal-task-project').innerText = task.project ? task.project.name : 'Genel';
            document.getElementById('modal-task-desc').innerText = task.description || 'Bu görev için detaylı açıklama girilmemiş.';
        });

    // 2. Göreve Ait Dosyaları Çek
    dosyalariGetir(taskId, token);

    // 3. Göreve Ait Yorumları Çek
    yorumlariYukle(taskId, token);
}

function closeTaskDetailModal() {
    document.getElementById('taskDetailModal').style.display = 'none';
}

// --- DOSYA YÜKLEME VE LİSTELEME FONKSİYONLARI ---

function dosyaYukle() {
    const taskId = document.getElementById('comment-task-id').value;
    const fileInput = document.getElementById('task-file-input');
    const file = fileInput.files[0];
    const token = localStorage.getItem('jwtToken');

    if (!file) {
        alert("Lütfen önce yüklenecek bir dosya seçin!");
        return;
    }

    // Dosyayı göndermek için özel FormData kargosu oluşturuyoruz
    const formData = new FormData();
    formData.append('file', file);

    // Yükleniyor bilgisi ver
    const container = document.getElementById('attachments-container');
    container.innerHTML = '<span class="text-warning small"><i class="fas fa-spinner fa-spin me-2"></i>Dosya yükleniyor, lütfen bekleyin...</span>';

    fetch(`http://localhost:8080/api/attachments/upload/${taskId}`, {
        method: 'POST',
        headers: { 
            'Authorization': 'Bearer ' + token 
            // DİKKAT: FormData kullandığımız için 'Content-Type' yazmıyoruz, tarayıcı kendisi otomatik ayarlıyor.
        }, 
        body: formData
    })
    .then(async res => {
        const msg = await res.text();
        if(res.ok) {
            fileInput.value = ''; // Seçilen dosyayı temizle
            dosyalariGetir(taskId, token); // Güncel listeyi yeniden çek
        } else {
            alert("Yükleme Başarısız: " + msg);
            dosyalariGetir(taskId, token); // Hata olsa da listeyi eski haline getir
        }
    })
    .catch(err => {
        alert("Bağlantı hatası: Dosya yüklenemedi!");
        dosyalariGetir(taskId, token);
    });
}

function dosyalariGetir(taskId, token) {
    const container = document.getElementById('attachments-container');
    container.innerHTML = '<span class="text-muted small"><i class="fas fa-spinner fa-spin me-2"></i>Dosyalar taranıyor...</span>';

    fetch(`http://localhost:8080/api/attachments/task/${taskId}`, { 
        headers: { 'Authorization': 'Bearer ' + token } 
    })
    .then(res => res.json())
    .then(attachments => {
        container.innerHTML = '';
        
        if (attachments.length === 0) {
            container.innerHTML = '<span class="text-white-50 small" style="font-size: 0.8rem;">Bu göreve henüz dosya eklenmemiş.</span>';
            return;
        }

        // Buton yapısı ve Güvenli İndirme fonksiyonunu tetikleme
        attachments.forEach(att => {
            container.innerHTML += `
                <button type="button" onclick="dosyaIndir(${att.id}, '${att.fileName}')" 
                   class="btn btn-sm btn-outline-info rounded-pill mb-2 me-2" 
                   style="font-size: 0.75rem; border-color: rgba(0, 210, 255, 0.3);">
                   <i class="fas fa-download me-1"></i> ${att.fileName}
                </button>
            `;
        });
    })
    .catch(err => container.innerHTML = '<span class="text-danger small">Dosyalar çekilemedi.</span>');
}

// --- GÜVENLİ DOSYA İNDİRME MOTORU ---
function dosyaIndir(attachmentId, fileName) {
    const token = localStorage.getItem('jwtToken');
    const container = document.getElementById('attachments-container');
    const originalHtml = container.innerHTML;
    
    container.innerHTML = `<span class="text-info small"><i class="fas fa-spinner fa-spin me-2"></i> ${fileName} indiriliyor...</span>`;

    fetch(`http://localhost:8080/api/attachments/download/${attachmentId}`, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token } 
    })
    .then(response => {
        if (!response.ok) throw new Error("Dosya indirilemedi! Yetkiniz olmayabilir.");
        return response.blob(); 
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName; 
        document.body.appendChild(a);
        a.click();
        
        window.URL.revokeObjectURL(url);
        container.innerHTML = originalHtml; 
    })
    .catch(err => {
        alert(err.message);
        container.innerHTML = originalHtml;
    });
}

// --- YORUM (NOT) İŞLEMLERİ ---

function yorumlariYukle(taskId, token) {
    const container = document.getElementById('comments-container');
    container.innerHTML = '<p class="text-muted small text-center mt-3"><i class="fas fa-spinner fa-spin me-2"></i>Yorumlar yükleniyor...</p>';

    fetch(`http://localhost:8080/api/comments/task/${taskId}`, { headers: { 'Authorization': 'Bearer ' + token } })
        .then(res => res.json())
        .then(comments => {
            container.innerHTML = '';
            if (comments.length === 0) {
                container.innerHTML = '<div class="text-center mt-4 mb-4"><i class="far fa-comment-dots fa-2x text-muted opacity-25 mb-2"></i><p class="text-muted small m-0">Henüz bir not eklenmemiş. İlk notu sen bırak.</p></div>';
                return;
            }
            
            comments.forEach(c => {
                const date = new Date(c.createdAt).toLocaleString('tr-TR', {day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'});
                const username = c.user ? (c.user.fullName || c.user.username) : 'Sistem';
                container.innerHTML += `
                    <div class="mb-3 p-3 rounded-4" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);">
                        <div class="d-flex justify-content-between align-items-center mb-2 border-bottom border-white border-opacity-10 pb-2">
                            <strong class="text-info" style="font-size:0.8rem"><i class="fas fa-user-circle me-1"></i> ${username}</strong>
                            <span class="text-white-50" style="font-size:0.7rem"><i class="far fa-clock me-1"></i> ${date}</span>
                        </div>
                        <p class="m-0 text-white opacity-75" style="font-size:0.85rem">${c.content}</p>
                    </div>
                `;
            });
            // Scroll'u en alta indir (en yeni yorum görünsün)
            container.scrollTop = container.scrollHeight;
        });
}

// Yeni Yorum Gönderme Formunu Dinle
document.getElementById('addCommentForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const taskId = document.getElementById('comment-task-id').value;
    const contentInput = document.getElementById('new-comment-text');
    const token = localStorage.getItem('jwtToken');
    const currentUser = JSON.parse(localStorage.getItem('user'));

    const commentData = {
        content: contentInput.value,
        task: { id: parseInt(taskId) },
        user: { id: currentUser.id }
    };

    fetch('http://localhost:8080/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify(commentData)
    }).then(res => {
        if(res.ok) {
            contentInput.value = ''; // Kutuyu temizle
            yorumlariYukle(taskId, token); // Yorumları tazele
        }
    });
});

// Modalı dışarı tıklayarak veya ESC tuşuna basarak kapatma
window.onclick = function(event) {
    const modal = document.getElementById('taskDetailModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") closeTaskDetailModal();
});

function logout() { localStorage.clear(); window.location.href = 'index.html'; }