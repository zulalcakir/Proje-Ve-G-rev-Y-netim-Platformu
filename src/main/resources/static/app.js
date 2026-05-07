// --- 1. FORM GEÇİŞ ANİMASYONLARI ---
// Butonlara HTML içinden onClick ile tıklandığı için global alanda bırakıyoruz
function switchForm(formType) {
    document.getElementById('userForm').style.display = 'none';
    document.getElementById('adminForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';

    document.getElementById('btn-user').classList.remove('active');
    document.getElementById('btn-admin').classList.remove('active');
    document.getElementById('btn-register').classList.remove('active');

    if (formType === 'user') {
        document.getElementById('userForm').style.display = 'block';
        document.getElementById('btn-user').classList.add('active');
    } else if (formType === 'admin') {
        document.getElementById('adminForm').style.display = 'block';
        document.getElementById('btn-admin').classList.add('active');
    } else if (formType === 'register') {
        document.getElementById('registerForm').style.display = 'block';
        document.getElementById('btn-register').classList.add('active');
    }
}

// Tüm HTML sayfası yüklendikten sonra form dinleyicilerini başlat (Güvenlik için)
document.addEventListener('DOMContentLoaded', function() {

    // --- 2. BACKEND'E (SPRING BOOT) BAĞLANMA İŞLEMLERİ ---

    // A) ÜYE GİRİŞİ İŞLEMİ
    const userForm = document.getElementById('userForm');
    if(userForm) {
        userForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Sayfanın yenilenmesini engelle
            
            const usernameInput = document.getElementById('user-username').value;
            const passwordInput = document.getElementById('user-password').value;

            fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: usernameInput, password: passwordInput })
            })
            .then(response => {
                if (response.ok) return response.json(); // Başarılıysa kullanıcı verisini al
                else throw new Error("Hata: Kullanıcı adı veya şifre yanlış!");
            })
            .then(user => {
                // Rol kontrolü yapıyoruz: ROLE_ADMIN var mı?
                const isAdmin = user.roles.some(role => role.name === 'ROLE_ADMIN');
                
                if (isAdmin) {
                    alert("Yönetici Girişi Onaylandı! Yönetim Paneline gidiliyor...");
                    window.location.href = 'admin.html'; 
                } else {
                    alert("Giriş Başarılı! Yönlendiriliyorsunuz...");
                    window.location.href = 'dashboard.html'; 
                }
            })
            .catch(error => {
                console.error('Bağlantı hatası:', error);
                alert(error.message || "Sunucuya bağlanılamadı. Spring Boot çalışıyor mu?");
            });
        });
    }

    // B) ADMİN GİRİŞİ İŞLEMİ
    const adminForm = document.getElementById('adminForm');
    if(adminForm) {
        adminForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const usernameInput = document.getElementById('admin-username').value;
            const passwordInput = document.getElementById('admin-password').value;

            fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: usernameInput, password: passwordInput })
            })
            .then(response => {
                if (response.ok) return response.json();
                else throw new Error("Hata: Yetkisiz giriş denemesi veya yanlış şifre!");
            })
            .then(user => {
                // Admin yetkisi olmayan birinin Admin sekmesinden girmesini engelliyoruz
                const isAdmin = user.roles.some(role => role.name === 'ROLE_ADMIN');
                
                if (isAdmin) {
                    alert("Yönetici Girişi Başarılı!");
                    window.location.href = 'admin.html'; 
                } else {
                    alert("Hata: Bu alan sadece yöneticiler içindir!");
                }
            })
            .catch(error => {
                console.error('Bağlantı hatası:', error);
                alert(error.message || "Sunucuya bağlanılamadı. Lütfen sistemi kontrol edin.");
            });
        });
    }

    // C) YENİ KAYIT OLMA İŞLEMİ
    const registerForm = document.getElementById('registerForm');
    if(registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Verileri topluyoruz
            const user = {
                username: document.getElementById('reg-username').value,
                email: document.getElementById('reg-email').value,
                password: document.getElementById('reg-password').value
            };

            fetch('http://localhost:8080/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            })
            .then(response => {
                if(response.ok) {
                    return response.json();
                } else {
                    throw new Error("Kayıt işlemi sunucu tarafından reddedildi.");
                }
            })
            .then(data => {
                if(data && data.id) {
                    alert("Kayıt Başarılı! Şimdi giriş yapabilirsiniz.");
                    // Formları temizleyip üye girişine atalım
                    document.getElementById('registerForm').reset();
                    switchForm('user'); 
                } else {
                    alert("Kayıt sırasında bir hata oluştu.");
                }
            })
            .catch(error => {
                console.error('Kayıt hatası:', error);
                alert("Veritabanına kayıt yapılamadı. Kullanıcı adı veya e-posta zaten kullanılıyor olabilir.");
            });
        });
    }
});