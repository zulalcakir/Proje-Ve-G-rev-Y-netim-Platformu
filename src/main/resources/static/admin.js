document.addEventListener('DOMContentLoaded', function() {
    // 1. Güvenlik ve Token Kontrolü
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('jwtToken');
    
    if (!storedUser || !token || token === "null") {
        localStorage.clear();
        window.location.href = 'index.html';
        return;
    }

    const currentUser = JSON.parse(storedUser);
    const isAdmin = currentUser.roles && currentUser.roles.some(role => role.name === 'ROLE_ADMIN');

    if (!isAdmin) {
        alert("Bu alana erişim yetkiniz yok!");
        window.location.href = 'dashboard.html';
        return;
    }

    // 2. İlk Veri Yüklemesi
    verileriTazele(token);

    // 3. Otomatik Yenileme (Loglar için her 30 saniyede bir)
    setInterval(() => {
        const activeToken = localStorage.getItem('jwtToken');
        if (activeToken) loglariYukle(activeToken);
    }, 30000);

    // --- FORM DİNLEYİCİLERİ ---

    // A - Kullanıcı Kayıt
    const adminAddUserForm = document.getElementById('adminAddUserForm');
    if(adminAddUserForm) {
        adminAddUserForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const newUser = {
                fullName: document.getElementById('admin-reg-name').value,
                email: document.getElementById('admin-reg-email').value,
                username: document.getElementById('admin-reg-username').value,
                password: document.getElementById('admin-reg-password').value
            };

            fetch('http://localhost:8080/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify(newUser)
            })
            .then(handleResponse)
            .then(() => {
                alert("Kullanıcı başarıyla oluşturuldu.");
                closeUserModal();
                verileriTazele(token);
                adminAddUserForm.reset();
            })
            .catch(err => alert("Kayıt Hatası: " + err.message));
        });
    }

    // B - Proje Başlatma
    const adminAddProjectForm = document.getElementById('adminAddProjectForm');
    if(adminAddProjectForm) {
        adminAddProjectForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const newProject = {
                name: document.getElementById('proj-name').value,
                description: document.getElementById('proj-desc').value,
                endDate: document.getElementById('proj-deadline').value,
                manager: { id: parseInt(document.getElementById('proj-manager').value) },
                createdBy: { id: currentUser.id }
            };

            fetch('http://localhost:8080/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify(newProject)
            })
            .then(handleResponse)
            .then(() => {
                alert("Proje başarıyla başlatıldı!");
                closeProjectModal();
                verileriTazele(token);
                adminAddProjectForm.reset();
            })
            .catch(err => alert("Proje Hatası: " + err.message));
        });
    }

    // C - Görev Atama
    const adminAddTaskForm = document.getElementById('adminAddTaskForm');
    if(adminAddTaskForm) {
        adminAddTaskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const newTask = {
                title: document.getElementById('task-title').value,
                description: document.getElementById('task-desc').value,
                dueDate: document.getElementById('task-deadline').value,
                status: 'BEKLEMEDE',
                project: { id: parseInt(document.getElementById('task-project').value) },
                assignedTo: { id: parseInt(document.getElementById('task-user').value) },
                priority: { id: parseInt(document.getElementById('task-priority').value) } 
            };

            fetch('http://localhost:8080/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify(newTask)
            })
            .then(handleResponse)
            .then(() => {
                alert("Görev başarıyla atandı!");
                closeTaskModal();
                verileriTazele(token);
                adminAddTaskForm.reset();
            })
            .catch(err => alert("Görev Atama Hatası: " + err.message));
        });
    }

    // D - Yorum Gönderme Formu (Admin için)
    const addCommentForm = document.getElementById('addCommentForm');
    if(addCommentForm) {
        addCommentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const taskId = document.getElementById('comment-task-id').value;
            const contentInput = document.getElementById('new-comment-text');
            const commentToken = localStorage.getItem('jwtToken');
            const commentUser = JSON.parse(localStorage.getItem('user'));

            const commentData = {
                content: contentInput.value,
                task: { id: parseInt(taskId) },
                user: { id: commentUser.id }
            };

            fetch('http://localhost:8080/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + commentToken },
                body: JSON.stringify(commentData)
            }).then(res => {
                if(res.ok) {
                    contentInput.value = '';
                    yorumlariYukle(taskId, commentToken);
                }
            });
        });
    }
});

// --- MERKEZİ YANIT VE HATA YÖNETİCİSİ ---

function handleResponse(res) {
    if (res.status === 401) {
        alert("Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.");
        localStorage.clear();
        window.location.href = 'index.html';
        return Promise.reject("401 Unauthorized");
    }
    if (!res.ok) {
        return res.text().then(text => { throw new Error(text || "İşlem başarısız.") });
    }
    return res.status !== 204 ? res.json() : null;
}

function verileriTazele(token) {
    istatistikleriYukle(token);
    kullaniciTablosunuYukle(token);
    projeleriYukle(token); 
    loglariYukle(token);
    gorevTablosunuYukle(token);
    cezaSiralamasiniYukle(token); 
}

// --- VERİ YÜKLEME FONKSİYONLARI ---

function istatistikleriYukle(token) {
    fetch('http://localhost:8080/api/admin/stats', { headers: { 'Authorization': 'Bearer ' + token } })
    .then(handleResponse)
    .then(data => {
        if(data) {
            document.getElementById('totalUsers').innerText = data.totalUsers || 0;
            document.getElementById('totalProjects').innerText = data.totalProjects || 0;
            document.getElementById('completedTasks').innerText = data.completedTasks || 0;
        }
    })
    .catch(err => console.warn("İstatistikler yüklenemedi."));
}

function kullaniciTablosunuYukle(token) {
    fetch('http://localhost:8080/api/users', { headers: { 'Authorization': 'Bearer ' + token } })
    .then(handleResponse)
    .then(users => {
        const tbody = document.getElementById('adminUserTable');
        if(!tbody || !users) return;
        tbody.innerHTML = '';
        users.forEach(user => {
            const roles = user.roles.map(r => `<span class="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-25 small" style="font-size:0.6rem">${r.name}</span>`).join(' ');
            tbody.innerHTML += `
                <tr>
                    <td class="ps-4 text-muted small">#${user.id}</td>
                    <td class="fw-bold text-white">${user.fullName || '-'}</td>
                    <td class="text-info">@${user.username}</td>
                    <td class="small text-white-50">${user.email}</td>
                    <td>${roles}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-danger border-0" onclick="kullaniciSil(${user.id})"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
        });
    });
}

function projeleriYukle(token) {
    fetch('http://localhost:8080/api/projects', { headers: { 'Authorization': 'Bearer ' + token } })
    .then(handleResponse)
    .then(projects => {
        const tbody = document.getElementById('adminProjectTable');
        if(!tbody || !projects) return;
        tbody.innerHTML = '';

        const uniqueProjects = [];
        const seenIds = new Set();
        projects.forEach(p => {
            if (!seenIds.has(p.id)) {
                seenIds.add(p.id);
                uniqueProjects.push(p);
            }
        });

        uniqueProjects.forEach(p => {
            const start = new Date(p.createdAt).toLocaleDateString('tr-TR');
            const end = p.endDate ? new Date(p.endDate).toLocaleDateString('tr-TR') : '-';
            const managerName = p.manager ? (p.manager.fullName || p.manager.username) : 'Atanmamış';

            tbody.innerHTML += `
                <tr>
                    <td class="ps-4 fw-bold text-info">${p.name}</td>
                    <td><span class="text-white-50">${managerName}</span></td>
                    <td class="small text-muted">${start}</td>
                    <td class="small text-danger">${end}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-light border-0" onclick="deleteProject(${p.id})"><i class="fas fa-archive"></i></button>
                    </td>
                </tr>`;
        });
    });
}

function gorevTablosunuYukle(token) {
    fetch('http://localhost:8080/api/tasks', { headers: { 'Authorization': 'Bearer ' + token } })
    .then(handleResponse)
    .then(tasks => {
        const tbody = document.getElementById('adminTaskTable');
        if(!tbody) return;
        tbody.innerHTML = '';
        tasks.forEach(t => {
            const date = t.dueDate ? new Date(t.dueDate).toLocaleDateString('tr-TR') : '-';
            const person = t.assignedTo ? (t.assignedTo.fullName || t.assignedTo.username) : 'Atanmamış';
            const statusClass = t.status === 'TAMAMLANDI' ? 'text-success' : (t.status === 'DEVAM_EDIYOR' ? 'text-info' : 'text-warning');
            
            tbody.innerHTML += `
                <tr>
                    <td class="ps-4 fw-bold text-white">${t.title}</td>
                    <td class="small">${t.project ? t.project.name : 'Genel'}</td>
                    <td class="text-info small">@${person}</td>
                    <td class="${statusClass} fw-bold small">${t.status}</td>
                    <td class="small text-muted">${date}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-info border-0" onclick="openTaskDetailModal(${t.id})">
                            <i class="fas fa-comment-dots"></i>
                        </button>
                    </td>
                </tr>`;
        });
    });
}

function cezaSiralamasiniYukle(token) {
    fetch('http://localhost:8080/api/penalties', { headers: { 'Authorization': 'Bearer ' + token } })
    .then(handleResponse)
    .then(penalties => {
        const tbody = document.getElementById('adminPenaltyTable');
        if(!tbody) return;
        tbody.innerHTML = '';
        
        if(!penalties || penalties.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">Sistemde henüz kimse ceza almamış. Harika!</td></tr>';
            return;
        }

        const userPenalties = {};
        
        penalties.forEach(p => {
            if(!p.user) return; 
            const uid = p.user.id;
            
            if(!userPenalties[uid]) {
                userPenalties[uid] = {
                    user: p.user,
                    totalScore: 0,
                    latestPenalty: null 
                };
            }
            
            userPenalties[uid].totalScore += p.penaltyScore;
            
            if(!userPenalties[uid].latestPenalty || new Date(p.penaltyDate) > new Date(userPenalties[uid].latestPenalty.penaltyDate)) {
                userPenalties[uid].latestPenalty = p;
            }
        });

        const sortedUsers = Object.values(userPenalties).sort((a, b) => b.totalScore - a.totalScore);

        let sira = 1;
        sortedUsers.forEach(data => {
            const userName = data.user.fullName || data.user.username;
            const lp = data.latestPenalty; 
            
            const taskName = lp.task ? lp.task.title : 'Genel İhlal';
            const projectName = (lp.task && lp.task.project) ? lp.task.project.name : 'Genel';
            const reason = lp.reason || 'Belirtilmedi';
            
            let siraGorseli = sira;
            if(sira === 1) siraGorseli = '<i class="fas fa-fire text-danger fa-lg"></i>';
            else if(sira === 2) siraGorseli = '<i class="fas fa-exclamation-triangle text-warning"></i>';
            
            tbody.innerHTML += `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td class="ps-4 fw-bold text-white-50 fs-5">${siraGorseli}</td>
                    <td class="fw-bold text-info">@${userName}</td>
                    <td><span class="badge bg-danger bg-opacity-25 text-danger px-3 py-2 fs-6">-${data.totalScore} Puan</span></td>
                    <td class="small text-white-50">
                        <strong class="text-white">${taskName}</strong><br>
                        <span class="text-muted" style="font-size:0.7rem;">Proje: ${projectName}</span>
                    </td>
                    <td class="small text-warning" style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${reason}">
                        ${reason}
                    </td>
                </tr>
            `;
            sira++;
        });
    })
    .catch(err => console.warn("Ceza liderlik tablosu yüklenemedi", err));
}

function loglariYukle(token) {
    const logContainer = document.getElementById('systemLogs');
    if(!logContainer) return;

    fetch('http://localhost:8080/api/logs', { headers: { 'Authorization': 'Bearer ' + token } })
    .then(handleResponse)
    .then(logs => {
        if(!logs) return;
        logContainer.innerHTML = ''; 
        logs.slice(-20).reverse().forEach(log => {
            const timeStr = new Date(log.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
            let color = log.action.includes('silindi') ? 'text-danger' : 
                        log.action.includes('başlatıldı') || log.action.includes('atandı') ? 'text-success' : 'text-white-50';
            logContainer.innerHTML += `<div class="mb-1 small"><span class="text-info">[${timeStr}]</span> <span class="text-warning fw-bold">${log.user?.username || 'SİSTEM'}:</span> <span class="${color}">${log.action}</span></div>`;
        });
    });
}

// --- MODALLAR VE YARDIMCI ARAÇLAR ---

function openUserModal() { document.getElementById('userModal').style.display = 'block'; }
function closeUserModal() { document.getElementById('userModal').style.display = 'none'; }

function openProjectModal() { 
    document.getElementById('projectModal').style.display = 'block';
    populatePersonelSelect('proj-manager');
}
function closeProjectModal() { document.getElementById('projectModal').style.display = 'none'; }

function openTaskModal() {
    document.getElementById('taskModal').style.display = 'block';
    populatePersonelSelect('task-user');
    populateProjectSelect('task-project');
    populatePrioritySelect('task-priority'); 
}
function closeTaskModal() { document.getElementById('taskModal').style.display = 'none'; }

function openTaskDetailModal(taskId) {
    document.getElementById('taskDetailModal').style.display = 'block';
    document.getElementById('comment-task-id').value = taskId;
    const token = localStorage.getItem('jwtToken');

    fetch(`http://localhost:8080/api/tasks/${taskId}`, { headers: { 'Authorization': 'Bearer ' + token } })
        .then(res => res.json())
        .then(task => {
            document.getElementById('modal-task-title').innerText = task.title;
            document.getElementById('modal-task-project').innerText = task.project ? task.project.name : 'Genel';
            document.getElementById('modal-task-desc').innerText = task.description || 'Detay girilmemiş.';
        });

    dosyalariGetir(taskId, token);
    yorumlariYukle(taskId, token);
}

function closeTaskDetailModal() { document.getElementById('taskDetailModal').style.display = 'none'; }

// DİNAMİK VERİ DOLDURMA FONKSİYONLARI

function populatePersonelSelect(elementId) {
    const select = document.getElementById(elementId);
    if(!select) return;
    const token = localStorage.getItem('jwtToken');
    fetch('http://localhost:8080/api/users', { headers: { 'Authorization': 'Bearer ' + token } })
    .then(handleResponse).then(users => {
        if(!users) return;
        select.innerHTML = '<option value="">Personel Seçin...</option>';
        users.forEach(u => select.innerHTML += `<option value="${u.id}">${u.fullName || u.username}</option>`);
    });
}

function populateProjectSelect(elementId) {
    const select = document.getElementById(elementId);
    if(!select) return;
    const token = localStorage.getItem('jwtToken');
    fetch('http://localhost:8080/api/projects', { headers: { 'Authorization': 'Bearer ' + token } })
    .then(handleResponse).then(projects => {
        if(!projects) return;
        select.innerHTML = '<option value="">Proje Seçin...</option>';
        const seenIds = new Set();
        projects.forEach(p => {
            if (!seenIds.has(p.id)) {
                seenIds.add(p.id);
                select.innerHTML += `<option value="${p.id}">${p.name}</option>`;
            }
        });
    });
}

function populatePrioritySelect(elementId) {
    const select = document.getElementById(elementId);
    if(!select) return;
    const token = localStorage.getItem('jwtToken');
    fetch('http://localhost:8080/api/priorities', { headers: { 'Authorization': 'Bearer ' + token } })
    .then(handleResponse).then(priorities => {
        if(!priorities) return;
        select.innerHTML = '<option value="">Öncelik Belirleyin...</option>';
        priorities.forEach(p => {
            const priorityName = p.level || p.name || `Seviye ${p.id}`;
            select.innerHTML += `<option value="${p.id}">${priorityName}</option>`;
        });
    });
}

// --- GÜNCELLENDİ: DOSYALARI GETİRME FONKSİYONU ---
function dosyalariGetir(taskId, token) {
    const container = document.getElementById('attachments-container');
    if(!container) return; 
    
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

        attachments.forEach(att => {
            // YENİ: Link yerine buton kullanıyoruz ve dosyaIndir fonksiyonunu tetikliyoruz.
            container.innerHTML += `
                <button onclick="dosyaIndir(${att.id}, '${att.fileName}')" 
                   class="btn btn-sm btn-outline-info rounded-pill mb-2 me-2" 
                   style="font-size: 0.75rem; border-color: rgba(0, 210, 255, 0.3);">
                   <i class="fas fa-download me-1"></i> ${att.fileName}
                </button>
            `;
        });
    })
    .catch(err => container.innerHTML = '<span class="text-danger small">Dosyalar çekilemedi.</span>');
}

// --- YENİ EKLENDİ: GÜVENLİ DOSYA İNDİRME MOTORU ---
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

function yorumlariYukle(taskId, token) {
    const container = document.getElementById('comments-container');
    container.innerHTML = '<p class="text-muted small text-center mt-3">Yükleniyor...</p>';
    fetch(`http://localhost:8080/api/comments/task/${taskId}`, { headers: { 'Authorization': 'Bearer ' + token } })
    .then(res => res.json())
    .then(comments => {
        container.innerHTML = '';
        if (comments.length === 0) {
            container.innerHTML = '<p class="text-muted small text-center mt-3">Henüz yorum yok.</p>';
            return;
        }
        comments.forEach(c => {
            const username = c.user ? (c.user.fullName || c.user.username) : 'Sistem';
            container.innerHTML += `
                <div class="mb-2 p-2 rounded" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);">
                    <small class="text-info fw-bold">${username}:</small>
                    <p class="m-0 text-white small opacity-75">${c.content}</p>
                </div>`;
        });
        container.scrollTop = container.scrollHeight;
    });
}

function kullaniciSil(id) {
    if(!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    const token = localStorage.getItem('jwtToken');
    fetch(`http://localhost:8080/api/users/${id}`, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } })
    .then(res => { if(res.ok) verileriTazele(token); });
}

function deleteProject(id) {
    if(!confirm('Bu projeyi silmek istediğinize emin misiniz?')) return;
    const token = localStorage.getItem('jwtToken');
    fetch(`http://localhost:8080/api/projects/${id}`, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } })
    .then(res => { if(res.ok) verileriTazele(token); });
}

function logout() { localStorage.clear(); window.location.href = 'index.html'; }

window.onclick = (e) => {
    ['userModal', 'projectModal', 'taskModal', 'taskDetailModal'].forEach(mId => {
        const m = document.getElementById(mId);
        if (m && e.target == m) m.style.display = "none";
    });
}