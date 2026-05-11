document.addEventListener('DOMContentLoaded', function() {
    // Sayfa açıldığında kullanıcı bilgilerini yükle
    loadUserProfile();

    // Form gönderildiğinde güncelleme yap
    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateProfile();
    });
});

/**
 * Mevcut kullanıcı bilgilerini backend'den çeker
 */
function loadUserProfile() {
    const token = localStorage.getItem('jwtToken'); // Senin sistemindeki token anahtarı hangisiyse (jwtToken veya token)

    fetch('/api/users/me', {
        headers: { 
            'Authorization': 'Bearer ' + token 
        }
    })
    .then(response => {
        if (!response.ok) throw new Error("Profil yüklenemedi");
        return response.json();
    })
    .then(user => {
        // Form alanlarını doldur
        document.getElementById('profile-full-name').value = user.fullName;
        document.getElementById('profile-email').value = user.email;
        
        // Görsel alanları doldur
        document.getElementById('display-full-name').innerText = user.fullName;
        document.getElementById('display-username').innerText = '@' + user.username;
        document.getElementById('profile-display-avatar').innerText = user.fullName.charAt(0).toUpperCase();
    })
    .catch(error => {
        console.error("Hata:", error);
    });
}

/**
 * Kullanıcı ismini backend'e gönderir ve günceller
 */
function updateProfile() {
    const token = localStorage.getItem('jwtToken');
    const updatedFullName = document.getElementById('profile-full-name').value;
    const statusDiv = document.getElementById('update-status');

    fetch('/api/users/me', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ fullName: updatedFullName })
    })
    .then(async response => {
        const data = await response.json();
        
        if (response.ok) {
            statusDiv.style.display = "block";
            statusDiv.style.background = "rgba(0, 242, 195, 0.1)";
            statusDiv.style.color = "#00f2c3";
            statusDiv.innerText = "Profil başarıyla güncellendi! 🚀";
            
            // Üstteki görsel alanları anlık güncelle
            document.getElementById('display-full-name').innerText = updatedFullName;
            document.getElementById('profile-display-avatar').innerText = updatedFullName.charAt(0).toUpperCase();

            // 2 saniye sonra sayfayı yenileyerek her yerin güncellenmesini sağla
            setTimeout(() => location.reload(), 2000);
        } else {
            statusDiv.style.display = "block";
            statusDiv.style.background = "rgba(255, 0, 127, 0.1)";
            statusDiv.style.color = "#ff007f";
            statusDiv.innerText = "Hata: " + (data.message || "Güncellenemedi.");
        }
    })
    .catch(error => {
        statusDiv.style.display = "block";
        statusDiv.innerText = "Sunucuya bağlanılamadı.";
    });
}

/**
 * Çıkış yapma fonksiyonu
 */
function logout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}