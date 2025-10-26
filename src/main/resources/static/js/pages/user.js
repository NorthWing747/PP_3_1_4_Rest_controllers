// /static/js/pages/user.js

async function loadUserProfile() {
    try {
        const response = await fetch('/api/users/current');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const user = await response.json();
        renderUserProfile(user);
    } catch (error) {
        showError('Error loading user data: ' + error.message);
    }
}

function renderUserProfile(user) {
    const roles = user.roles ? user.roles.map(r => r.name.replace('ROLE_', '')).join(', ') : 'No roles';
    document.getElementById('currentUserInfo').innerHTML =
        `<strong>${user.email}</strong> with roles: ${roles}`;

    if (user.roles?.some(role => role.name === 'ROLE_ADMIN')) {
        document.getElementById('adminLink').style.display = 'block';
    }

    document.getElementById('userTableBody').innerHTML = `
        <tr>
            <td>${user.id}</td>
            <td>${user.name || '-'}</td>
            <td>${user.surname || '-'}</td>
            <td>${user.age || '-'}</td>
            <td>${user.email}</td>
            <td>
                ${user.roles ? user.roles.map(role =>
        `<span class="badge ${role.name === 'ROLE_ADMIN' ? 'badge-admin' : 'badge-user'} me-1">
                        ${role.name.replace('ROLE_', '')}
                    </span>`
    ).join('') : '<span class="badge bg-secondary">No roles</span>'}
            </td>
        </tr>`;
}

function showError(message) {
    document.getElementById('userTableBody').innerHTML = `
        <tr>
            <td colspan="6" class="text-center text-danger">
                <p>${message}</p>
                <button class="btn btn-primary btn-sm" onclick="loadUserProfile()">Try Again</button>
            </td>
        </tr>`;

    document.getElementById('currentUserInfo').innerHTML =
        '<span class="text-warning">Error loading user information</span>';
}

document.addEventListener('DOMContentLoaded', loadUserProfile);
