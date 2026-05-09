document.addEventListener('DOMContentLoaded', function() {
    // 1. Güvenlik ve Token Kontrolü
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('jwtToken');
    
    // Token yoksa veya 'null' metni kalmışsa temizle ve login'e at
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
                assignedTo: { id: parseInt(document.getElementById('task-user').value) }
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

        // --- ÇİFT KAYITLARI ENGELLEME (UNIQUE FILTER) ---
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
}
function closeTaskModal() { document.getElementById('taskModal').style.display = 'none'; }

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
        
        // Burayı da tekilleştiriyoruz ki select içinde de çift görünmesin
        const seenIds = new Set();
        projects.forEach(p => {
            if (!seenIds.has(p.id)) {
                seenIds.add(p.id);
                select.innerHTML += `<option value="${p.id}">${p.name}</option>`;
            }
        });
    });
}

function kullaniciSil(id) {
    if(!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    const token = localStorage.getItem('jwtToken');
    fetch(`http://localhost:8080/api/users/${id}`, { 
        method: 'DELETE', 
        headers: { 'Authorization': 'Bearer ' + token } 
    }).then(res => { if(res.ok) verileriTazele(token); });
}

function deleteProject(id) {
    if(!confirm('Bu projeyi silmek istediğinize emin misiniz?')) return;
    const token = localStorage.getItem('jwtToken');
    fetch(`http://localhost:8080/api/projects/${id}`, { 
        method: 'DELETE', 
        headers: { 'Authorization': 'Bearer ' + token } 
    }).then(res => { if(res.ok) verileriTazele(token); });
}

function logout() { localStorage.clear(); window.location.href = 'index.html'; }

window.onclick = (e) => {
    ['userModal', 'projectModal', 'taskModal'].forEach(mId => {
        const m = document.getElementById(mId);
        if (m && e.target == m) m.style.display = "none";
    });
}