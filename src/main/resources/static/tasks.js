document.addEventListener('DOMContentLoaded', function() {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('jwtToken');
    
    if (!storedUser || !token || token === "null") {
        window.location.href = 'index.html';
        return;
    }

    const currentUser = JSON.parse(storedUser);
    updateUI(currentUser);
    gorevleriDagit(currentUser.id, token);
});

function updateUI(user) {
    document.getElementById('user-full-name').innerText = user.fullName || user.username;
    document.getElementById('user-avatar').innerText = (user.fullName || user.username).charAt(0).toUpperCase();
}

async function gorevleriDagit(userId, token) {
    const columns = {
        'BEKLEMEDE': document.getElementById('col-BEKLEMEDE'),
        'DEVAM_EDIYOR': document.getElementById('col-DEVAM_EDIYOR'),
        'TAMAMLANDI': document.getElementById('col-TAMAMLANDI')
    };

    // Kolonları temizle
    Object.values(columns).forEach(col => col.innerHTML = '');

    try {
        const res = await fetch(`http://localhost:8080/api/tasks/user/${userId}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const tasks = await res.json();

        tasks.forEach(task => {
            const col = columns[task.status] || columns['BEKLEMEDE'];
            const date = task.dueDate ? new Date(task.dueDate).toLocaleDateString('tr-TR') : 'Süresiz';
            
            col.innerHTML += `
                <div class="task-card">
                    <div class="small text-info mb-1">${task.project ? task.project.name : 'Genel'}</div>
                    <h6 class="text-white fw-bold mb-2">${task.title}</h6>
                    <p class="text-muted small mb-3" style="font-size:0.75rem">${task.description || ''}</p>
                    <div class="d-flex justify-content-between align-items-center border-top border-white border-opacity-10 pt-2">
                        <span class="text-white-50" style="font-size:0.7rem"><i class="far fa-calendar me-1"></i> ${date}</span>
                        <div class="btn-group">
                            ${task.status !== 'TAMAMLANDI' ? `
                                <button class="btn btn-sm btn-outline-light border-0" onclick="statusGuncelle(${task.id}, 'DEVAM_EDIYOR')"><i class="fas fa-play text-info"></i></button>
                                <button class="btn btn-sm btn-outline-light border-0" onclick="statusGuncelle(${task.id}, 'TAMAMLANDI')"><i class="fas fa-check text-success"></i></button>
                            ` : '<i class="fas fa-check-double text-success"></i>'}
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (e) { console.error("Yükleme hatası:", e); }
}

function statusGuncelle(taskId, newStatus) {
    const token = localStorage.getItem('jwtToken');
    fetch(`http://localhost:8080/api/tasks/${taskId}/status?newStatus=${newStatus}`, {
        method: 'PATCH',
        headers: { 'Authorization': 'Bearer ' + token }
    }).then(res => {
        if(res.ok) location.reload();
    });
}

function logout() { localStorage.clear(); window.location.href = 'index.html'; }