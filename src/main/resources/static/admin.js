document.addEventListener('DOMContentLoaded', function() {
    // 1. Tarayıcı hafızasından token'ı kontrol et
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        // Yetkisiz erişim varsa giriş sayfasına at
        window.location.href = 'index.html';
        return;
    }

    // 2. Sayfa yüklendiğinde tabloları ve logları getir (Token ile)
    verileriYukle(token);
    loglariYukle(token);

    // 3. Her 30 saniyede bir logları arka planda otomatik yenile (Token ile)
    setInterval(() => loglariYukle(token), 30000);

    // 4. Yeni Kullanıcı Formunu Dinle
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

            // Post isteğine Token EKLENDİ
            fetch('http://localhost:8080/api/users', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(newUser)
            })
            .then(response => {
                if(response.ok) {
                    closeUserModal(); // Başarılıysa pencereyi kapat
                    verileriYukle(token);  // Tabloyu tazele
                    loglariYukle(token);   // Loglara "Yeni kullanıcı eklendi" düşsün
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
function verileriYukle(token) {
    // Ortak Header
    const authHeaders = {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
    };

    fetch('http://localhost:8080/api/users', { headers: authHeaders })
    .then(res => {
        if(!res.ok) throw new Error("Yetkisiz erişim");
        return res.json();
    })
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
    })
    .catch(err => console.error("Kullanıcılar yüklenemedi:", err));

    fetch('http://localhost:8080/api/projects', { headers: authHeaders })
    .then(res => {
        if(!res.ok) throw new Error("Yetkisiz erişim");
        return res.json();
    })
    .then(projects => {
        document.getElementById('projectCount').innerText = projects.length;
    })
    .catch(err => console.error("Projeler yüklenemedi:", err));
}

// --- LOGLARI YÜKLEME ---
function loglariYukle(token) {
    const logContainer = document.getElementById('systemLogs');
    
    fetch('http://localhost:8080/api/logs', { 
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(res => {
        if(!res.ok) throw new Error("Yetkisiz erişim");
        return res.json();
    })
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
        logContainer.innerHTML = '<div class="text-danger">Loglar yüklenirken sunucuya ulaşılamadı veya yetkiniz yok.</div>';
    });
}

// --- SİLME İŞLEMİ ---
function kullaniciSil(id) {
    const token = localStorage.getItem('jwtToken'); // Silme işlemi için güncel token'ı al
    if (!token) return;

    if(confirm('Bu kullanıcıyı tamamen silmek istediğinize emin misiniz?')) {
        fetch(`http://localhost:8080/api/users/${id}`, { 
            method: 'DELETE',
            headers: { 
                'Authorization': 'Bearer ' + token 
            }
        })
        .then(res => {
            if(res.ok) {
                verileriYukle(token); 
                loglariYukle(token);  
            } else {
                alert("Kullanıcı silinirken bir hata oluştu veya yetkiniz yok.");
            }
        })
        .catch(err => console.error("Silme hatası:", err));
    }
}