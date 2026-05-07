// --- 1. FORM GEÇİŞ ANİMASYONLARI (Aynen Kalıyor) ---
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

// --- 2. BACKEND'E (SPRING BOOT) BAĞLANMA İŞLEMLERİ ---

// A) ÜYE GİRİŞİ İŞLEMİ
document.getElementById('userForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Sayfanın yenilenmesini engelle
    
    const username = document.getElementById('user-username').value;
    const password = document.getElementById('user-password').value;

    // Arka taraftaki AuthController'a istek atıyoruz
    fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: password })
    })
    .then(response => {
        if (response.ok) {
            alert("Giriş Başarılı! Yönlendiriliyorsunuz...");
            window.location.href = 'dashboard.html'; // ANA PANELE GEÇİŞ!
        } else {
            alert("Hata: Kullanıcı adı veya şifre yanlış!");
        }
    })
    .catch(error => console.error('Bağlantı hatası:', error));
});

// B) ADMİN GİRİŞİ İŞLEMİ
document.getElementById('adminForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;

    fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: password })
    })
    .then(response => {
        if (response.ok) {
            // İleride admin paneli farklı olursa buradaki yönlendirmeyi admin.html yapabilirsin
            alert("Yönetici Girişi Başarılı!");
            window.location.href = 'dashboard.html'; 
        } else {
            alert("Hata: Yetkisiz giriş denemesi veya yanlış şifre!");
        }
    })
    .catch(error => console.error('Bağlantı hatası:', error));
});

// C) YENİ KAYIT OLMA İŞLEMİ
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // UserController tarafındaki User nesnesine uygun verileri alıyoruz
    const user = {
        username: document.getElementById('reg-username').value,
        email: document.getElementById('reg-email').value,
        password: document.getElementById('reg-password').value
        // Ad Soyad için modelde yer açtıysanız onu da buraya ekleyebilirsiniz
    };

    fetch('http://localhost:8080/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    })
    .then(response => response.json())
    .then(data => {
        if(data.id) {
            alert("Kayıt Başarılı! Şimdi giriş yapabilirsiniz.");
            switchForm('user'); // Kayıt olunca otomatik Üye Girişi sekmesine at
        } else {
            alert("Kayıt sırasında bir hata oluştu.");
        }
    })
    .catch(error => console.error('Bağlantı hatası:', error));
});