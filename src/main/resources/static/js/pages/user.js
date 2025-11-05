// /static/js/pages/user.js

async function loadUserProfile() {
    try {
        const response = await fetch('/api/user/current');

        if (response.status === 401) {
            // не авторизован — отправляем на логин
            window.location.href = '/login';
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const user = await response.json();
        renderUserProfile(user);
    } catch (error) {
        renderError('Ошибка загрузки данных пользователя: ' + error.message);
    }
}

function roleText(role) {
    return (role?.name || '').replace('ROLE_', '');
}

function renderUserProfile(user) {
    const currentUserInfo = document.getElementById('currentUserInfo');
    const adminLink = document.getElementById('adminLink');
    const tbody = document.getElementById('userTableBody');

    if (!currentUserInfo || !tbody) return;

    const roles = Array.isArray(user.roles) ? user.roles : [];
    const rolesText = roles.length
        ? roles.map(r => roleText(r)).join(', ')
        : 'No roles';

    currentUserInfo.innerHTML = `<strong>${user.email}</strong> with roles: ${rolesText}`;

    if (adminLink) {
        const isAdmin = roles.some(r => r.name === 'ROLE_ADMIN');
        adminLink.style.display = isAdmin ? 'block' : 'none';
    }

    const badges = roles.length
        ? roles.map(r => {
            const isAdmin = r.name === 'ROLE_ADMIN';
            // если нет своих стилей .badge-admin/.badge-user — используем bootstrap
            const klass = isAdmin ? 'badge bg-primary me-1' : 'badge bg-secondary me-1';
            return `<span class="${klass}">${roleText(r)}</span>`;
        }).join('')
        : '<span class="badge bg-secondary">No roles</span>';

    tbody.innerHTML = `
    <tr>
      <td>${user.id ?? '-'}</td>
      <td>${user.name ?? '-'}</td>
      <td>${user.surname ?? '-'}</td>
      <td>${user.age ?? '-'}</td>
      <td>${user.email ?? '-'}</td>
      <td>${badges}</td>
    </tr>`;
}

function renderError(message) {
    const tbody = document.getElementById('userTableBody');
    const currentUserInfo = document.getElementById('currentUserInfo');
    const retryBtnId = 'retry-load-user';

    if (tbody) {
        tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-danger">
          <p class="mb-2">${message}</p>
          <button id="${retryBtnId}" class="btn btn-primary btn-sm">Try Again</button>
        </td>
      </tr>`;
        // навешиваем обработчик без inline onclick
        const btn = document.getElementById(retryBtnId);
        btn?.addEventListener('click', loadUserProfile);
    }
    if (currentUserInfo) {
        currentUserInfo.innerHTML = '<span class="text-warning">Error loading user information</span>';
    }
}

document.addEventListener('DOMContentLoaded', loadUserProfile);
