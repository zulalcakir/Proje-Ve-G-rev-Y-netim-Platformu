// --- 1. MESAJ GÖSTERME FONKSİYONU ---
function showAuthMessage(text, isError) {
    const msgDiv = document.getElementById('auth-message');
    if (!msgDiv) return;

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
    const msgDiv = document.getElementById('auth-message');
    if (msgDiv) msgDiv.style.display = 'none';

    document.getElementById('userForm').style.display = 'none';
    document.getElementById('adminForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    
    const resetSection = document.getElementById('resetSection');
    const formButtons = document.getElementById('form-buttons');
    if(resetSection) resetSection.style.display = 'none';
    if(formButtons) formButtons.style.display = 'flex';

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

// --- ŞİFRE SIFIRLAMA İŞLEMLERİ ---
const BASE_URL = 'http://p-platform-env.eba-kcxaqihg.eu-west-1.elasticbeanstalk.com';

function showResetSection() {
    document.getElementById('userForm').style.display = 'none';
    document.getElementById('adminForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('form-buttons').style.display = 'none';
    
    const msgDiv = document.getElementById('auth-message');
    if (msgDiv) msgDiv.style.display = 'none';
    document.getElementById('resetSection').style.display = 'block';
}

function requestResetCode() {
    const email = document.getElementById('reset-email').value;
    if(!email) {
        showAuthMessage("Lütfen kayıtlı e-posta adresinizi girin.", true);
        return;
    }

    fetch(`${BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
    }).then(async res => {
        const msg = await res.text();
        if(res.ok) {
            showAuthMessage(msg, false);
            document.getElementById('forgot-step-1').style.display = 'none';
            document.getElementById('forgot-step-2').style.display = 'block';
        } else {
            showAuthMessage(msg, true);
        }
    }).catch(err => showAuthMessage("Sunucuya ulaşılamadı.", true));
}

function performPasswordReset() {
    const token = document.getElementById('reset-token').value;
    const newPassword = document.getElementById('reset-new-password').value;
    
    if(!token || !newPassword) {
        showAuthMessage("Lütfen doğrulama kodunu ve yeni şifrenizi girin.", true);
        return;
    }

    fetch(`${BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token, newPassword: newPassword })
    }).then(async res => {
        const msg = await res.text();
        if(res.ok) {
            showAuthMessage("Şifreniz başarıyla güncellendi! Yönlendiriliyorsunuz...", false);
            setTimeout(() => {
                document.getElementById('forgot-step-1').style.display = 'block';
                document.getElementById('forgot-step-2').style.display = 'none';
                document.getElementById('reset-email').value = '';
                document.getElementById('reset-token').value = '';
                document.getElementById('reset-new-password').value = '';
                switchForm('user');
            }, 2000);
        } else {
            showAuthMessage(msg, true);
        }
    }).catch(err => showAuthMessage("Bağlantı hatası oluştu.", true));
}

document.addEventListener('DOMContentLoaded', function() {

    // --- 3. ÜYE GİRİŞİ ---
    const userForm = document.getElementById('userForm');
    if(userForm) {
        userForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const usernameInput = document.getElementById('user-username').value;
            const passwordInput = document.getElementById('user-password').value;
            const rememberMeInput = document.getElementById('user-remember').checked;

            fetch(`${BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username: usernameInput, 
                    password: passwordInput,
                    rememberMe: rememberMeInput 
                })
            })
            .then(async response => {
                if (response.ok) return response.json();
                else {
                    const errorMsg = await response.text();
                    throw new Error(errorMsg || "Kullanıcı adı veya şifre hatalı!");
                }
            })
            .then(data => {
                const user = data.user;
                const token = data.token;
                const isAdmin = user.roles && user.roles.some(role => role.name === 'ROLE_ADMIN');
                
                if (isAdmin) {
                    throw new Error("Yöneticiler bu alanı kullanamaz. Lütfen Yönetici Girişi sekmesini kullanın!");
                }
                
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('jwtToken', token);
                window.location.href = 'dashboard.html'; 
            })
            .catch(error => showAuthMessage(error.message, true));
        });
    }

    // --- 4. ADMIN GİRİŞİ ---
    const adminForm = document.getElementById('adminForm');
    if(adminForm) {
        adminForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const usernameInput = document.getElementById('admin-username').value;
            const passwordInput = document.getElementById('admin-password').value;
            const rememberMeInput = document.getElementById('admin-remember').checked;

            fetch(`${BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username: usernameInput, 
                    password: passwordInput,
                    rememberMe: rememberMeInput
                })
            })
            .then(async response => {
                if (response.ok) return response.json();
                else {
                    const errorMsg = await response.text();
                    throw new Error(errorMsg || "Yönetici kodu veya şifre yanlış!");
                }
            })
            .then(data => {
                const user = data.user;
                const token = data.token;
                const isAdmin = user.roles && user.roles.some(role => role.name === 'ROLE_ADMIN');
                
                if (isAdmin) {
                    localStorage.setItem('user', JSON.stringify(user));
                    localStorage.setItem('jwtToken', token);
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
                fullName: document.getElementById('reg-name').value, 
                username: document.getElementById('reg-username').value,
                email: document.getElementById('reg-email').value,
                password: document.getElementById('reg-password').value
            };

            fetch(`${BASE_URL}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            })
            .then(async response => {
                if(response.ok) return response.json();
                const errorData = await response.text();
                throw new Error(errorData || "Kayıt sırasında bir hata oluştu!");
            })
            .then(data => {
                showAuthMessage("Kayıt Başarılı! Giriş yapabilirsiniz.", false);
                setTimeout(() => switchForm('user'), 1500);
            })
            .catch(error => {
                showAuthMessage(error.message, true);
                console.error("Kayıt Hatası Detayı:", error);
            });
        });
    }
});