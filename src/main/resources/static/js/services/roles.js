// /static/js/services/roles.js
export const roleLabel = r => r.name.replace('ROLE_', '');

export function toRoleNames(selectedOptions) {
    return Array.from(selectedOptions).map(opt => {
        const text = opt.textContent.trim();
        const name = text.startsWith('ROLE_') ? text : 'ROLE_' + text;
        return { name };
    });
}
