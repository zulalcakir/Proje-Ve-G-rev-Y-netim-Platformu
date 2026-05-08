document.addEventListener('DOMContentLoaded', function() {
    // 1. Sayfa yüklendiğinde tabloları ve logları getir
    verileriYukle();
    loglariYukle();

    // 2. Her 30 saniyede bir logları arka planda otomatik yenile (Canlı akış için)
    setInterval(loglariYukle, 30000);

    // 3. Yeni Kullanıcı Formunu Dinle (Eksik olan kısım buydu)
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            })
            .then(response => {
                if(response.ok) {
                    closeUserModal(); // Başarılıysa pencereyi kapat
                    verileriYukle();  // Tabloyu tazele
                    loglariYukle();   // Loglara "Yeni kullanıcı eklendi" düşsün
                    adminAddUserForm.reset(); // Formu temizle
                } else {
                    alert("Kullanıcı eklenirken bir hata oluştu. Kullanıcı adı veya e-posta alınmış olabilir.");
                }
            })
            .catch(err => console.error("Kayıt Hatası:", err));
        });
    }
});

// --- MODAL KONTROLLERİ ---
function openUserModal() {
    document.getElementById('userModal').style.display = 'block';
}

function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
}

// Pencere dışında bir yere tıklanırsa kapat
window.onclick = function(event) {
    const modal = document.getElementById('userModal');
    if (event.target == modal) {
        closeUserModal();
    }
}

// --- VERİ YÜKLEME ---
function verileriYukle() {
    fetch('http://localhost:8080/api/users')
    .then(res => res.json())
    .then(users => {
        document.getElementById('userCount').innerText = users.length;
        const tbody = document.getElementById('adminUserTable');
        tbody.innerHTML = '';

        users.forEach(user => {
            const roles = user.roles && user.roles.length > 0 
                          ? user.roles.map(r => r.name).join(', ') 
                          : 'ÜYE';
            
            tbody.innerHTML += `
                <tr>
                    <td>${user.id}</td>
                    <td class="fw-bold">${user.username}</td>
                    <td>${user.email || 'Girilmemiş'}</td>
                    <td><span class="badge bg-warning text-dark">${roles}</span></td>
                    <td>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="status-${user.id}" checked>
                        </div>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-info me-1">Güncelle</button>
                        <button class="btn btn-sm btn-danger" onclick="kullaniciSil(${user.id})">Sil</button>
                    </td>
                </tr>
            `;
        });
    });

    fetch('http://localhost:8080/api/projects')
    .then(res => res.json())
    .then(projects => {
        document.getElementById('projectCount').innerText = projects.length;
    });
}

// --- LOGLARI YÜKLEME ---
function loglariYukle() {
    const logContainer = document.getElementById('systemLogs');
    
    fetch('http://localhost:8080/api/logs')
    .then(res => res.json())
    .then(logs => {
        if (logs.length === 0) {
            logContainer.innerHTML = '<div class="text-muted">Henüz bir hareket kaydedilmedi.</div>';
            return;
        }

        logContainer.innerHTML = ''; 
        
        logs.reverse().forEach(log => {
            const date = new Date(log.timestamp);
            const timeStr = date.toLocaleTimeString('tr-TR');
            
            let textColor = 'text-white';
            if (log.action.includes('silindi') || log.action.includes('Hata')) textColor = 'text-danger';
            else if (log.action.includes('eklendi') || log.action.includes('kayıt')) textColor = 'text-success';
            else if (log.action.includes('giriş')) textColor = 'text-info';

            logContainer.innerHTML += `
                <div class="${textColor} mb-1">
                    <span class="text-secondary">[${timeStr}]</span> 
                    <strong>${log.user ? log.user.username : 'SİSTEM'}:</strong> ${log.action}
                </div>
            `;
        });
    })
    .catch(err => {
        logContainer.innerHTML = '<div class="text-danger">Loglar yüklenirken sunucuya ulaşılamadı.</div>';
    });
}

// --- SİLME İŞLEMİ ---
function kullaniciSil(id) {
    if(confirm('Bu kullanıcıyı tamamen silmek istediğinize emin misiniz?')) {
        fetch(`http://localhost:8080/api/users/${id}`, { method: 'DELETE' })
        .then(res => {
            if(res.ok) {
                verileriYukle(); 
                loglariYukle();  
            } else {
                alert("Kullanıcı silinirken bir hata oluştu.");
            }
        })
        .catch(err => console.error("Silme hatası:", err));
    }
}