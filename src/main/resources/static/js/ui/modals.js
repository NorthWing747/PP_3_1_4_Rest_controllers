// /static/js/ui/modals.js
export function openEditModal(user, allRoles) {
    // Заполнить форму редактирования
    document.getElementById('editId').value = user.id ?? '';
    document.getElementById('editName').value = user.name ?? '';
    document.getElementById('editSurname').value = user.surname ?? '';
    document.getElementById('editAge').value = user.age ?? '';
    document.getElementById('editEmail').value = user.email ?? '';
    document.getElementById('editPassword').value = '';

    // Заполнить селект ролей
    const sel = document.getElementById('editRoleSelect');
    sel.innerHTML = allRoles
        .map(r => `<option value="${r.id}">${r.name.replace('ROLE_', '')}</option>`)
        .join('');

    // Выделить текущие роли
    const current = new Set((user.roles || []).map(r => r.id));
    Array.from(sel.options).forEach(o => (o.selected = current.has(+o.value)));

    new bootstrap.Modal('#editUserModal').show();
}

export function closeEditModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
    modal?.hide();
}
