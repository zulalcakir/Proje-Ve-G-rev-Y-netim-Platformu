/**
 * P-PLATFORM Profil Sayfası Mantığı
 * Kullanıcı bilgilerini AWS üzerinden çeker ve günceller.
 */

// AWS Linkini merkezi bir sabit olarak tanımlayalım
const BASE_URL = 'http://p-platform-env.eba-kcxaqihg.eu-west-1.elasticbeanstalk.com';

document.addEventListener('DOMContentLoaded', function() {
    // Sayfa açıldığında kullanıcı bilgilerini yükle
    loadUserProfile();

    // Form gönderildiğinde güncelleme yap
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateProfile();
        });
    }
});

/**
 * Mevcut kullanıcı bilgilerini backend'den (AWS) çeker
 */
function loadUserProfile() {
    const token = localStorage.getItem('jwtToken'); 

    fetch(`${BASE_URL}/api/users/me`, {
        headers: { 
            'Authorization': 'Bearer ' + token 
        }
    })
    .then(response => {
        if (response.status === 401 || response.status === 403) {
            logout(); // Yetki hatasında çıkış yaptır
            throw new Error("Oturum süresi dolmuş");
        }
        if (!response.ok) throw new Error("Profil yüklenemedi");
        return response.json();
    })
    .then(user => {
        // Form alanlarını doldur
        if (document.getElementById('profile-full-name'))
            document.getElementById('profile-full-name').value = user.fullName;
        
        if (document.getElementById('profile-email'))
            document.getElementById('profile-email').value = user.email;
        
        // Görsel alanları doldur
        if (document.getElementById('display-full-name'))
            document.getElementById('display-full-name').innerText = user.fullName;
        
        if (document.getElementById('display-username'))
            document.getElementById('display-username').innerText = '@' + user.username;
        
        if (document.getElementById('profile-display-avatar'))
            document.getElementById('profile-display-avatar').innerText = user.fullName.charAt(0).toUpperCase();
    })
    .catch(error => {
        console.error("Hata:", error);
    });
}

/**
 * Kullanıcı ismini backend'e (AWS) gönderir ve günceller
 */
function updateProfile() {
    const token = localStorage.getItem('jwtToken');
    const updatedFullName = document.getElementById('profile-full-name').value;
    const statusDiv = document.getElementById('update-status');

    fetch(`${BASE_URL}/api/users/me`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ fullName: updatedFullName })
    })
    .then(async response => {
        let data = {};
        try { data = await response.json(); } catch(e) {}
        
        if (response.ok) {
            if (statusDiv) {
                statusDiv.style.display = "block";
                statusDiv.style.background = "rgba(0, 242, 195, 0.1)";
                statusDiv.style.color = "#00f2c3";
                statusDiv.innerText = "Profil başarıyla güncellendi! 🚀";
            }
            
            // Üstteki görsel alanları anlık güncelle
            if (document.getElementById('display-full-name'))
                document.getElementById('display-full-name').innerText = updatedFullName;
            
            if (document.getElementById('profile-display-avatar'))
                document.getElementById('profile-display-avatar').innerText = updatedFullName.charAt(0).toUpperCase();

            // LocalStorage'daki user bilgisini de güncelle ki dashboard'da eski isim kalmasın
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            user.fullName = updatedFullName;
            localStorage.setItem('user', JSON.stringify(user));

            // 2 saniye sonra sayfayı yenileyerek her yerin güncellenmesini sağla
            setTimeout(() => location.reload(), 2000);
        } else {
            if (statusDiv) {
                statusDiv.style.display = "block";
                statusDiv.style.background = "rgba(255, 0, 127, 0.1)";
                statusDiv.style.color = "#ff007f";
                statusDiv.innerText = "Hata: " + (data.message || "Güncellenemedi.");
            }
        }
    })
    .catch(error => {
        if (statusDiv) {
            statusDiv.style.display = "block";
            statusDiv.innerText = "Sunucuya bağlanılamadı.";
        }
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