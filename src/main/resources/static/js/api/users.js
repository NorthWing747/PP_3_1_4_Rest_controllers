// /static/js/api/users.js
export async function fetchUsers() {
    const r = await fetch('/api/users');
    if (!r.ok) throw new Error('Failed to load users');
    return r.json();
}

export async function fetchRoles() {
    const r = await fetch('/api/roles');
    if (!r.ok) throw new Error('Failed to load roles');
    return r.json();
}

export async function createUser(user) {
    return fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });
}

export async function updateUser(user) {
    return fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });
}

export async function deleteUserById(id) {
    return fetch(`/api/users/${id}`, { method: 'DELETE' });
}
