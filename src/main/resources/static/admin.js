document.addEventListener('DOMContentLoaded', function() {
    // 1. Tüm Kullanıcıları Getir
    fetch('http://localhost:8080/api/users')
    .then(res => res.json())
    .then(users => {
        document.getElementById('userCount').innerText = users.length;
        const tbody = document.getElementById('adminUserTable');
        tbody.innerHTML = '';

        users.forEach(user => {
            const roles = user.roles.map(r => r.name).join(', ');
            tbody.innerHTML += `
                <tr>
                    <td>${user.id}</td>
                    <td class="fw-bold">${user.username}</td>
                    <td>${user.email || 'Girilmemiş'}</td>
                    <td><span class="badge bg-warning text-dark">${roles}</span></td>
                    <td><button class="btn btn-sm btn-danger">Kullanıcıyı Sil</button></td>
                </tr>
            `;
        });
    });

    // 2. Tüm Projeleri Getir (İstatistik için)
    fetch('http://localhost:8080/api/projects')
    .then(res => res.json())
    .then(projects => {
        document.getElementById('projectCount').innerText = projects.length;
    });
});