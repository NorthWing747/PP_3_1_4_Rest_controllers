const apiUrl = '/api/users';

async function loadUsers() {
    const res = await fetch(apiUrl);
    const users = await res.json();
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    users.forEach(user => {
        const roles = user.roles.map(r => r.name.replace('ROLE_', '')).join(', ');
        tbody.innerHTML += `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.surname}</td>
                <td>${user.email}</td>
                <td>${roles}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="openEditModal(${user.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">Delete</button>
                </td>
            </tr>
        `;
    });
}

async function deleteUser(id) {
    await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
    await loadUsers();
}

document.addEventListener('DOMContentLoaded', loadUsers);
