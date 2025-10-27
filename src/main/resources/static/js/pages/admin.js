import { fetchUsers, fetchRoles, createUser, updateUser, deleteUserById } from '../api/users.js';
// import { roleLabel, toRoleNames } from '../services/roles.js';
import { roleLabel, toRoleIds, toRoleNames } from '../services/roles.js';
import { openEditModal, closeEditModal } from '../ui/modals.js';

let ALL_USERS = [];
let ALL_ROLES = [];

function toRoleIdsFromSelect(selectEl) {
    return Array.from(selectEl.selectedOptions).map(o => ({ id: Number(o.value) }));
}

// создание
const addSel = document.getElementById('addRoles');
const newUser = {
    // ...
    roles: toRoleIdsFromSelect(addSel)
};

// редактирование
const editSel = document.getElementById('editRoleSelect');
const payload = {
    // ...
    roles: toRoleIdsFromSelect(editSel)
};

function renderUsers() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = ALL_USERS.map(u => `
        <tr data-id="${u.id}">
            <td>${u.id}</td>
            <td>${u.name || ''}</td>
            <td>${u.surname || ''}</td>
            <td>${u.age || ''}</td>
            <td>${u.email || ''}</td>
            <td>${(u.roles || []).map(roleLabel).join(', ')}</td>
            <td><button class="btn btn-sm btn-info" data-edit="${u.id}">Edit</button></td>
            <td><button class="btn btn-sm btn-danger" data-del="${u.id}">Delete</button></td>
        </tr>`).join('');
}

function showUsersTable() {
    document.getElementById('usersTableSection').style.display = 'block';
    document.getElementById('newUserSection').style.display = 'none';

    document.getElementById('users-tab-btn').classList.add('active');
    document.getElementById('new-user-tab-btn').classList.remove('active');
}

function showAddUserForm() {
    document.getElementById('usersTableSection').style.display = 'none';
    document.getElementById('newUserSection').style.display = 'block';

    document.getElementById('users-tab-btn').classList.remove('active');
    document.getElementById('new-user-tab-btn').classList.add('active');
}

async function reloadAndRender() {
    ALL_USERS = await fetchUsers();
    renderUsers();
}

document.addEventListener('DOMContentLoaded', async () => {
    ALL_ROLES = await fetchRoles();

    const addRoleSelect = document.getElementById('addRoles');
    addRoleSelect.innerHTML = ALL_ROLES.map(r =>
        `<option value="${r.id}">${r.name.replace('ROLE_', '')}</option>`).join('');

    await reloadAndRender();

    document.getElementById('users-tab-btn').addEventListener('click', (e) => {
        e.preventDefault();
        showUsersTable();
    });

    document.getElementById('new-user-tab-btn').addEventListener('click', (e) => {
        e.preventDefault();
        showAddUserForm();
    });


    document.getElementById('usersTableBody').addEventListener('click', async (e) => {
        const idEdit = e.target.dataset.edit;
        const idDel = e.target.dataset.del;

        if (idEdit) {
            const user = ALL_USERS.find(u => u.id === +idEdit);
            openEditModal(user, ALL_ROLES);
        }

        if (idDel) {
            await deleteUserById(+idDel);
            await reloadAndRender();
        }
    });

    document.getElementById('addUserForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = {
            username: document.getElementById('addUsername').value.trim(), // <–– ДОБАВЛЕНО!
            name: document.getElementById('addName').value.trim(),
            surname: document.getElementById('addSurname').value.trim(),
            age: Number(document.getElementById('addAge').value),
            email: document.getElementById('addEmail').value.trim(),
            password: document.getElementById('addPassword').value,
            // roles: toRoleNames(document.getElementById('addRoles').selectedOptions)
            roles: toRoleIds(document.getElementById('addRoles').selectedOptions)
        };

        await createUser(user);
        await reloadAndRender();
        showUsersTable();
        e.target.reset();
    });
});

document.getElementById('editUserForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = Number(document.getElementById('editId').value);
    const payload = {
        id,
        username: document.getElementById('editUsername').value.trim(),
        name:     document.getElementById('editName').value.trim(),
        surname:  document.getElementById('editSurname').value.trim(),
        age:      Number(document.getElementById('editAge').value),
        email:    document.getElementById('editEmail').value.trim(),
        password: document.getElementById('editPassword').value, // пустая строка = не менять
        roles:    toRoleIds(document.getElementById('editRoleSelect').selectedOptions)
    };

    const res = await updateUser(payload); // у тебя уже импортирован updateUser
    if (!res.ok) {
        console.error('Update failed:', res.status, await res.text());
        alert('Ошибка сохранения пользователя');
        return;
    }

    // закрыть модалку и обновить таблицу
    closeEditModal();
    await reloadAndRender();
});

