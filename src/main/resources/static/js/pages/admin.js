// /static/js/pages/admin.js
import { fetchUsers, fetchRoles, createUser, updateUser, deleteUserById } from '../api/users.js';
import { roleLabel, toRoleIds /* , toRoleNames */ } from '../services/roles.js';
import { openEditModal, closeEditModal } from '../ui/modals.js';

let ALL_USERS = [];
let ALL_ROLES = [];

// утилита: собрать [{id}] из multiple-select
function toRoleIdsFromSelect(selectEl) {
    return Array.from(selectEl.selectedOptions).map(o => ({ id: Number(o.value) }));
}

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
    ALL_USERS = await fetchUsers(); // GET /api/admin/users
    renderUsers();
}

document.addEventListener('DOMContentLoaded', async () => {
    // 1) Подтянем роли и заполним селект создания
    ALL_ROLES = await fetchRoles(); // GET /api/admin/roles

    const addRoleSelect = document.getElementById('addRoles');
    addRoleSelect.innerHTML = ALL_ROLES
        .map(r => `<option value="${r.id}">${r.name.replace('ROLE_', '')}</option>`)
        .join('');

    // 2) Стартовая загрузка таблицы
    await reloadAndRender();

    // 3) Переключатели вкладок
    document.getElementById('users-tab-btn').addEventListener('click', (e) => {
        e.preventDefault(); showUsersTable();
    });
    document.getElementById('new-user-tab-btn').addEventListener('click', (e) => {
        e.preventDefault(); showAddUserForm();
    });

    // 4) Делегирование по таблице: Edit / Delete
    document.getElementById('usersTableBody').addEventListener('click', async (e) => {
        const idEdit = e.target.dataset.edit;
        const idDel  = e.target.dataset.del;

        if (idEdit) {
            const user = ALL_USERS.find(u => u.id === +idEdit);
            openEditModal(user, ALL_ROLES); // модалка сама заполнит поля и multiple-select
            return;
        }

        if (idDel) {
            const idNum = +idDel;
            if (!confirm(`Удалить пользователя #${idNum}?`)) return;
            try {
                await deleteUserById(idNum); // DELETE /api/admin/users/{id}
                await reloadAndRender();
            } catch (err) {
                console.error(err);
                alert('Не удалось удалить пользователя: ' + err.message);
            }
        }
    });

    // 5) Создание пользователя
    document.getElementById('addUserForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = {
            username: document.getElementById('addUsername').value.trim(),
            name:     document.getElementById('addName').value.trim(),
            surname:  document.getElementById('addSurname').value.trim(),
            age:      Number(document.getElementById('addAge').value),
            email:    document.getElementById('addEmail').value.trim(),
            password: document.getElementById('addPassword').value,
            // если используешь общий helper:
            roles:    toRoleIds(document.getElementById('addRoles').selectedOptions)
            // либо локально: roles: toRoleIdsFromSelect(document.getElementById('addRoles'))
        };

        try {
            await createUser(user); // POST /api/admin/users
            await reloadAndRender();
            showUsersTable();
            e.target.reset();
        } catch (err) {
            console.error(err);
            alert('Ошибка создания пользователя: ' + err.message);
        }
    });
});

// 6) Сохранение из модалки Edit
document.getElementById('editUserForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
        id:       Number(document.getElementById('editId').value),
        username: document.getElementById('editUsername').value.trim(),
        name:     document.getElementById('editName').value.trim(),
        surname:  document.getElementById('editSurname').value.trim(),
        age:      Number(document.getElementById('editAge').value),
        email:    document.getElementById('editEmail').value.trim(),
        password: document.getElementById('editPassword').value, // пустая строка → на бэке игнорировать
        roles:    toRoleIds(document.getElementById('editRoleSelect').selectedOptions)
        // или локально: roles: toRoleIdsFromSelect(document.getElementById('editRoleSelect'))
    };

    try {
        await updateUser(payload); // PUT /api/admin/users/{id} — API уже проверяет статус и бросает ошибку
        closeEditModal();
        await reloadAndRender();
    } catch (err) {
        console.error(err);
        alert('Ошибка сохранения пользователя: ' + err.message);
    }
});
