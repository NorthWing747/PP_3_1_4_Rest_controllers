// /static/js/api/users.js

async function handleJsonResponse(r, what = 'request') {
    if (!r.ok) {
        const text = await r.text().catch(() => '');
        throw new Error(`${what} failed: HTTP ${r.status}${text ? ` — ${text}` : ''}`);
    }

    // 204 No Content → точно ничего не парсим
    if (r.status === 204) return null;

    // если не JSON или тело пустое — тоже возвращаем null
    const ct = (r.headers.get('content-type') || '').toLowerCase();
    if (!ct.includes('application/json')) {
        return null;
    }

    const raw = await r.text();           // читаем как текст, чтобы не падать на пустом теле
    if (!raw || !raw.trim()) return null; // пустая строка — нет контента

    return JSON.parse(raw);               // теперь точно валидный JSON
}

// === профиль текущего пользователя (для /user) ===
export async function fetchCurrentUser() {
    const r = await fetch('/api/user/current');
    return handleJsonResponse(r, 'load current user');
}

// === админские операции (для /admin) ===
export async function fetchUsers() {
    const r = await fetch('/api/admin/users');
    return handleJsonResponse(r, 'load users');
}

export async function fetchRoles() {
    const r = await fetch('/api/admin/roles');
    return handleJsonResponse(r, 'load roles');
}

export async function createUser(user) {
    const r = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });
    return handleJsonResponse(r, 'create user');
}

export async function updateUser(user) {
    const r = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });
    return handleJsonResponse(r, 'update user');
}

export async function deleteUserById(id) {
    const r = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    return handleJsonResponse(r, 'delete user');
}
