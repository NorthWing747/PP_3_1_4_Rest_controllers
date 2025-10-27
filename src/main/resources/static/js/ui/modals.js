// /static/js/ui/modals.js

export function openEditModal(user, allRoles) {
    const modalEl = document.getElementById('editUserModal');
    if (!modalEl) {
        console.warn('editUserModal not found');
        return;
    }

    // утилиты только для input/hidden/password/etc
    const get = (sel) => {
        const el = modalEl.querySelector(sel);
        if (!el) throw new Error(`Element ${sel} not found inside modal`);
        return el;
    };
    const setVal = (sel, val = '') => { const el = get(sel); el.value = val; return el; };

    // обычные поля
    setVal('#editId',        user.id ?? '');
    setVal('#editUsername',  user.username ?? '');
    setVal('#editName',      user.name ?? '');
    setVal('#editSurname',   user.surname ?? '');
    setVal('#editAge',       user.age ?? '');
    setVal('#editEmail',     user.email ?? '');
    setVal('#editPassword',  ''); // пусто — оставить старый пароль

    // Роли: НЕ трогаем .value у select, просто наполняем и выделяем
    const roleSelect = modalEl.querySelector('#editRoleSelect');
    roleSelect.innerHTML = allRoles
        .map(r => `<option value="${r.id}">${(r.name||'').replace('ROLE_','')}</option>`)
        .join('');

    // const currentIds = new Set((user.roles || []).map(r => Number(r.id)));
    // Array.from(roleSelect.options).forEach(o => o.selected = currentIds.has(Number(o.value)));

    const currentIds = new Set((user.roles || []).map(r => Number(r.id)));
    Array.from(roleSelect.options).forEach(o => {
        o.selected = currentIds.has(Number(o.value));
    });

    // const roleSelect = get('#editRoleSelect');
    // roleSelect.innerHTML = (allRoles || [])
    //     .map(r => `<option value="${r.id}">${(r.name || '').replace('ROLE_', '')}</option>`)
    //     .join('');
    //
    // const currentIds = new Set((user.roles || []).map(r => Number(r.id)));
    // Array.from(roleSelect.options).forEach(o => {
    //     o.selected = currentIds.has(Number(o.value));
    // });

    // показать модалку
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

export function closeEditModal() {
    const m = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
    m?.hide();
}
