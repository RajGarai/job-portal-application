/**
 * users.js — Users page
 * Register, look up (by ID or email), update, delete users.
 * View applications per user.
 *
 * Note: No GET /api/users (list-all) endpoint exists — lookup only.
 */

import { UsersAPI, ApplicationsAPI } from './api.js';
import {
  toast, confirmDialog, openModal, closeModal, registerModal,
  setButtonLoading, renderTableSkeleton, renderEmpty,
  collectFormData, resetForm, fieldError,
  escapeHtml, formatDate, roleBadge, statusBadge, animateCounter,
} from './ui.js';

// ─── State ───────────────────────────────────────────────────────────
let cachedUsers  = [];   // grows as users are looked up
let editingUserId = null;

// ─── Init ─────────────────────────────────────────────────────────────
export async function initUsers() {
  registerModal('user-modal');
  registerModal('user-apps-modal');
  setupUserForm();
  setupLookup();
  renderUsersHint();
}

// ─── Hint state ───────────────────────────────────────────────────────
function renderUsersHint() {
  const tbody = document.getElementById('users-table-body');
  if (!tbody) return;
  renderEmpty(tbody, '🔍', 'Look up users by ID or Email', 'Use the search tools above to find and manage users.');
}

// ─── Lookup ────────────────────────────────────────────────────────────
function setupLookup() {
  const idInput    = document.getElementById('lookup-id-input');
  const emailInput = document.getElementById('lookup-email-input');

  document.getElementById('lookup-id-btn')?.addEventListener('click', async () => {
    const v = idInput.value.trim();
    if (!v || isNaN(Number(v))) { toast.warning('Enter a valid numeric User ID'); return; }
    await lookupById(Number(v));
  });

  document.getElementById('lookup-email-btn')?.addEventListener('click', async () => {
    const v = emailInput.value.trim();
    if (!v || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { toast.warning('Enter a valid email address'); return; }
    await lookupByEmail(v);
  });

  idInput?.addEventListener('keydown',    e => { if (e.key === 'Enter') document.getElementById('lookup-id-btn').click(); });
  emailInput?.addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('lookup-email-btn').click(); });
}

async function lookupById(id) {
  showLookupLoading();
  try {
    const res = await UsersAPI.getById(id);
    cacheAndRender(res.data);
  } catch (err) {
    toast.error('User not found', err.message);
    renderUsersHint();
  }
}

async function lookupByEmail(email) {
  showLookupLoading();
  try {
    const res = await UsersAPI.getByEmail(email);
    cacheAndRender(res.data);
  } catch (err) {
    toast.error('User not found', err.message);
    renderUsersHint();
  }
}

function showLookupLoading() {
  const tbody = document.getElementById('users-table-body');
  if (tbody) renderTableSkeleton(tbody, 5, 2);
}

function cacheAndRender(user) {
  if (!user) return;
  const idx = cachedUsers.findIndex(u => u.userId === user.userId);
  if (idx >= 0) cachedUsers[idx] = user;
  else cachedUsers.push(user);
  updateUserBadge(cachedUsers.length);
  renderUsersTable([user]); // show only the looked-up user, not the whole cache
}

function updateUserBadge(count) {
  const el = document.getElementById('users-count');
  if (el) el.textContent = count;
}

// ─── Render table ─────────────────────────────────────────────────────
function renderUsersTable(users) {
  const tbody = document.getElementById('users-table-body');
  if (!tbody) return;

  if (!users.length) { renderUsersHint(); return; }

  tbody.innerHTML = users.map(user => `
    <tr>
      <td class="td-primary">
        <div style="display:flex;align-items:center;gap:10px">
          <div class="session-avatar" style="width:30px;height:30px;font-size:0.7rem;flex-shrink:0">
            ${(user.name || '?')[0].toUpperCase()}
          </div>
          <div>
            <div>${escapeHtml(user.name)}</div>
            <div style="font-size:0.72rem;color:var(--text-muted);font-family:var(--font-mono)">#${user.userId}</div>
          </div>
        </div>
      </td>
      <td>${escapeHtml(user.email)}</td>
      <td>${roleBadge(user.role)}</td>
      <td>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="btn btn-sm btn-secondary" onclick="window._users.viewApps(${user.userId})">📋 Apps</button>
          <button class="btn btn-sm btn-secondary" onclick="window._users.edit(${user.userId})">✏️ Edit</button>
          <button class="btn btn-sm btn-danger"    onclick="window._users.del(${user.userId})">🗑</button>
        </div>
      </td>
    </tr>`).join('');
}

// ─── User form ────────────────────────────────────────────────────────
function setupUserForm() {
  const form      = document.getElementById('user-form');
  const submitBtn = document.getElementById('user-submit-btn');

  document.getElementById('add-user-btn')?.addEventListener('click', () => {
    editingUserId = null;
    resetForm(form);
    document.querySelector('#user-modal .modal-title').textContent = 'Register User';
    submitBtn.textContent = 'Register';
    document.getElementById('user-pass-group').style.display = '';
    document.getElementById('user-pass-note').style.display = '';
    openModal('user-modal');
  });

  document.getElementById('user-modal-close')?.addEventListener('click', () => closeModal('user-modal'));
  document.getElementById('user-apps-modal-close')?.addEventListener('click', () => closeModal('user-apps-modal'));

  form?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateUserForm()) return;

    const d = collectFormData(form);
    const payload = { name: d.name, email: d.email, role: d.role };
    if (d.password) payload.password = d.password;

    setButtonLoading(submitBtn, true);
    try {
      let res;
      if (editingUserId) {
        res = await UsersAPI.update(editingUserId, payload);
        toast.success('User updated ✓', `${payload.name}'s profile saved.`);
      } else {
        res = await UsersAPI.register(payload);
        toast.success('User registered ✓', `Welcome, ${payload.name}!`);
      }
      cacheAndRender(res.data);
      closeModal('user-modal');
      resetForm(form);
      editingUserId = null;
    } catch (err) {
      toast.error('Save failed', err.message);
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
}

function validateUserForm() {
  let ok = true;
  const rules = [
    ['user-name',  'user-name-error',  'Name is required',           v => v.length > 0],
    ['user-email', 'user-email-error', 'Enter a valid email address', v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)],
    ['user-role',  'user-role-error',  'Please select a role',        v => v.length > 0],
  ];
  rules.forEach(([inputId, errId, msg, test]) => {
    const input = document.getElementById(inputId);
    const err   = document.getElementById(errId);
    if (!test(input.value.trim())) { fieldError(input, err, msg); ok = false; }
    else { input.classList.remove('error'); err?.classList.remove('show'); }
  });

  // Password required on register
  if (!editingUserId) {
    const passInput = document.getElementById('user-password');
    const passError = document.getElementById('user-pass-error');
    const val       = passInput.value;
    if (val.length < 6 || val.length > 12) {
      fieldError(passInput, passError, 'Password must be 6–12 characters');
      ok = false;
    } else {
      passInput.classList.remove('error');
      passError?.classList.remove('show');
    }
  }

  return ok;
}

// ─── Public action handlers ────────────────────────────────────────────
window._users = {
  edit: (id) => {
    const user = cachedUsers.find(u => u.userId === id);
    if (!user) { toast.warning('Look up the user first before editing.'); return; }
    editingUserId = id;
    document.querySelector('#user-modal .modal-title').textContent = 'Edit User';
    document.getElementById('user-submit-btn').textContent = 'Save Changes';
    document.getElementById('user-pass-group').style.display = 'none';
    document.getElementById('user-pass-note').style.display  = 'none';
    document.getElementById('user-name').value     = user.name  || '';
    document.getElementById('user-email').value    = user.email || '';
    document.getElementById('user-role').value     = user.role  || '';
    document.getElementById('user-password').value = '';
    openModal('user-modal');
  },

  del: (id) => {
    const user = cachedUsers.find(u => u.userId === id);
    confirmDialog(
      'Delete User?',
      `Remove "${user?.name || 'this user'}" permanently? This cannot be undone.`,
      async () => {
        try {
          await UsersAPI.delete(id);
          cachedUsers = cachedUsers.filter(u => u.userId !== id);
          updateUserBadge(cachedUsers.length);
          toast.success('User deleted', '');
          renderUsersHint();
        } catch (err) {
          toast.error('Delete failed', err.message);
        }
      }
    );
  },

  viewApps: async (userId) => {
    const user  = cachedUsers.find(u => u.userId === userId);
    const title = document.getElementById('user-apps-title');
    const tbody = document.getElementById('user-apps-list');

    if (title) title.textContent = `Applications — ${user?.name || 'User #' + userId}`;
    if (tbody) renderTableSkeleton(tbody, 4, 3);
    openModal('user-apps-modal');

    try {
      const res  = await ApplicationsAPI.getByUser(userId);
      const apps = res.data || [];

      if (!apps.length) {
        renderEmpty(tbody, '📋', 'No applications yet', 'This user has not applied to any jobs.');
        return;
      }

      tbody.innerHTML = apps.map(app => `
        <tr>
          <td class="td-primary">${escapeHtml(app.job?.title || '—')}</td>
          <td>${escapeHtml(app.job?.companyName || '—')}</td>
          <td>${statusBadge(app.status)}</td>
          <td style="font-size:0.8rem">${formatDate(app.createAt)}</td>
        </tr>`).join('');
    } catch (err) {
      renderEmpty(tbody, '⚠️', 'Failed to load', err.message);
      toast.error('Could not load applications', err.message);
    }
  },
};
