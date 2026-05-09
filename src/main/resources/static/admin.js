document.addEventListener('DOMContentLoaded', function() {
    // 1. Tarayıcı hafızasından kullanıcı ve token kontrolü
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('jwtToken');
    
    if (!storedUser || !token) {
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

    // 2. İlk Yükleme
    istatistikleriYukle(token);
    kullaniciTablosunuYukle(token);
    loglariYukle(token);

    // 3. Otomatik Yenileme (Loglar için)
    setInterval(() => loglariYukle(token), 30000);

    // --- FORM DİNLEYİCİLERİ ---

    // A - Yeni Kullanıcı Formu
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
            .then(res => {
                if(res.ok) {
                    alert("Kullanıcı başarıyla oluşturuldu.");
                    closeUserModal(); 
                    kullaniciTablosunuYukle(token);
                    istatistikleriYukle(token);
                    loglariYukle(token);
                    adminAddUserForm.reset();
                }
            });
        });
    }

    // B - Yeni Proje Formu (YENİ EKLENDİ)
    const adminAddProjectForm = document.getElementById('adminAddProjectForm');
    if(adminAddProjectForm) {
        adminAddProjectForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const newProject = {
                name: document.getElementById('proj-name').value,
                description: document.getElementById('proj-desc').value,
                endDate: document.getElementById('proj-deadline').value,
                // İlişkili nesneleri gönderiyoruz:
                manager: { id: document.getElementById('proj-manager').value },
                createdBy: { id: currentUser.id } 
            };

            fetch('http://localhost:8080/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify(newProject)
            })
            .then(res => {
                if(res.ok) {
                    alert("Proje başarıyla başlatıldı!");
                    closeProjectModal();
                    istatistikleriYukle(token); // Sayaçlar güncellensin
                    loglariYukle(token);       // Loglara düşsün
                    adminAddProjectForm.reset();
                } else {
                    alert("Proje oluşturulurken bir hata oluştu.");
                }
            })
            .catch(err => console.error("Proje Kayıt Hatası:", err));
        });
    }
});

// --- VERİ YÜKLEME FONKSİYONLARI ---

function istatistikleriYukle(token) {
    fetch('http://localhost:8080/api/admin/stats', {
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('totalUsers').innerText = data.totalUsers;
        document.getElementById('totalProjects').innerText = data.totalProjects;
        document.getElementById('completedTasks').innerText = data.completedTasks;
    });
}

function kullaniciTablosunuYukle(token) {
    fetch('http://localhost:8080/api/users', {
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(res => res.json())
    .then(users => {
        const tbody = document.getElementById('adminUserTable');
        tbody.innerHTML = '';
        users.forEach(user => {
            const roles = user.roles.map(r => `<span class="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-25 small" style="font-size:0.6rem">${r.name}</span>`).join(' ');
            tbody.innerHTML += `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td class="ps-4 text-muted small">#${user.id}</td>
                    <td class="fw-bold text-white">${user.fullName || '-'}</td>
                    <td class="text-info">@${user.username}</td>
                    <td class="small text-white-50">${user.email}</td>
                    <td>${roles}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-danger border-0" onclick="kullaniciSil(${user.id})">
                            <i class="fas fa-trash"></i> SİL
                        </button>
                    </td>
                </tr>`;
        });
    });
}

function loglariYukle(token) {
    const logContainer = document.getElementById('systemLogs');
    fetch('http://localhost:8080/api/logs', { headers: { 'Authorization': 'Bearer ' + token } })
    .then(res => res.json())
    .then(logs => {
        logContainer.innerHTML = ''; 
        logs.slice(-20).reverse().forEach(log => {
            const timeStr = new Date(log.timestamp).toLocaleTimeString('tr-TR');
            let actionColor = 'text-white-50';
            if (log.action.includes('silindi')) actionColor = 'text-danger';
            else if (log.action.includes('eklendi') || log.action.includes('başlatıldı')) actionColor = 'text-success';

            logContainer.innerHTML += `
                <div class="mb-1" style="font-size: 0.8rem;">
                    <span class="text-info">[${timeStr}]</span> 
                    <span class="text-warning fw-bold">${log.user ? log.user.username : 'SİSTEM'}:</span> 
                    <span class="${actionColor}">${log.action}</span>
                </div>`;
        });
    });
}

// --- MODAL VE YARDIMCI KONTROLLER ---

// Proje Sorumlusu (Manager) listesini dinamik doldur
function populateManagerSelect() {
    const token = localStorage.getItem('jwtToken');
    const select = document.getElementById('proj-manager');
    
    fetch('http://localhost:8080/api/users', {
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(res => res.json())
    .then(users => {
        select.innerHTML = '<option value="">Sorumlu Seçin...</option>';
        users.forEach(u => {
            select.innerHTML += `<option value="${u.id}">${u.fullName || u.username}</option>`;
        });
    });
}

function openUserModal() { document.getElementById('userModal').style.display = 'block'; }
function closeUserModal() { document.getElementById('userModal').style.display = 'none'; }

function openProjectModal() { 
    document.getElementById('projectModal').style.display = 'block';
    populateManagerSelect(); // Modal açıldığında listeyi tazele
}
function closeProjectModal() { document.getElementById('projectModal').style.display = 'none'; }

// Dışarı tıklayınca kapansın
window.onclick = (e) => {
    if (e.target == document.getElementById('userModal')) closeUserModal();
    if (e.target == document.getElementById('projectModal')) closeProjectModal();
}

function kullaniciSil(id) {
    const token = localStorage.getItem('jwtToken');
    if(!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    fetch(`http://localhost:8080/api/users/${id}`, { 
        method: 'DELETE', 
        headers: { 'Authorization': 'Bearer ' + token } 
    }).then(res => { if(res.ok) { kullaniciTablosunuYukle(token); istatistikleriYukle(token); loglariYukle(token); } });
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}