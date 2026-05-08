// --- 1. MESAJ GÖSTERME FONKSİYONU ---
function showAuthMessage(text, isError) {
    const msgDiv = document.getElementById('auth-message');
    msgDiv.innerText = text;
    msgDiv.style.display = 'block';
    
    if (isError) {
        msgDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.2)'; 
        msgDiv.style.color = '#ff4d4d'; 
        msgDiv.style.border = '1px solid #ff4d4d';
    } else {
        msgDiv.style.backgroundColor = 'rgba(0, 210, 255, 0.2)'; 
        msgDiv.style.color = '#00d2ff';
        msgDiv.style.border = '1px solid #00d2ff';
    }
}

// --- 2. FORM GEÇİŞLERİ ---
function switchForm(formType) {
    document.getElementById('auth-message').style.display = 'none';
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

document.addEventListener('DOMContentLoaded', function() {

    // --- 3. ÜYE GİRİŞİ (ADMİN GİRİŞİ ENGELLENDİ) ---
    const userForm = document.getElementById('userForm');
    if(userForm) {
        userForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const usernameInput = document.getElementById('user-username').value;
            const passwordInput = document.getElementById('user-password').value;

            fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: usernameInput, password: passwordInput })
            })
            .then(response => {
                if (response.ok) return response.json();
                else throw new Error("Kullanıcı adı veya şifre hatalı!");
            })
            .then(user => {
                const isAdmin = user.roles.some(role => role.name === 'ROLE_ADMIN');
                
                // KRİTİK KONTROL: Eğer adminse üye girişini engelle
                if (isAdmin) {
                    throw new Error("Yöneticiler bu alanı kullanamaz. Lütfen Admin sekmesinden giriş yapın!");
                }
                
                window.location.href = 'dashboard.html'; 
            })
            .catch(error => showAuthMessage(error.message, true));
        });
    }

    // --- 4. ADMIN GİRİŞİ (ÜYE GİRİŞİ ENGELLENDİ) ---
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
                else throw new Error("Yönetici kodu veya şifre yanlış!");
            })
            .then(user => {
                const isAdmin = user.roles.some(role => role.name === 'ROLE_ADMIN');
                
                // KRİTİK KONTROL: Eğer admin değilse admin girişini engelle
                if (isAdmin) {
                    window.location.href = 'admin.html';
                } else {
                    throw new Error("Bu alan sadece yöneticiler içindir!");
                }
            })
            .catch(error => showAuthMessage(error.message, true));
        });
    }

    // --- 5. KAYIT OLMA ---
    const registerForm = document.getElementById('registerForm');
    if(registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
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
                if(response.ok) return response.json();
                else throw new Error("Bu kullanıcı adı veya e-posta alınmış!");
            })
            .then(data => {
                showAuthMessage("Kayıt Başarılı! Giriş yapabilirsiniz.", false);
                setTimeout(() => switchForm('user'), 1500);
            })
            .catch(error => showAuthMessage(error.message, true));
        });
    }
});