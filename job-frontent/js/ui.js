/**
 * ui.js — Reusable UI utilities
 * Toasts · Modals · Loading · Form helpers · DOM utils
 */

// ─── TOASTS ──────────────────────────────────────────────────────────

let _toastContainer = null;
function getToastContainer() {
  if (!_toastContainer) {
    _toastContainer = document.createElement('div');
    _toastContainer.className = 'toast-container';
    document.body.appendChild(_toastContainer);
  }
  return _toastContainer;
}

export function showToast(title, message = '', type = 'info', duration = 4500) {
  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  const container = getToastContainer();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <div class="toast-body">
      <div class="toast-title">${escapeHtml(title)}</div>
      ${message ? `<div class="toast-message">${escapeHtml(message)}</div>` : ''}
    </div>
    <button class="toast-close" aria-label="Close">✕</button>`;

  const dismiss = () => {
    toast.style.animation = 'slideInRight 0.2s ease reverse forwards';
    setTimeout(() => toast.remove(), 200);
  };
  toast.querySelector('.toast-close').addEventListener('click', dismiss);
  container.appendChild(toast);
  if (duration > 0) setTimeout(dismiss, duration);
  return toast;
}

export const toast = {
  success: (t, m) => showToast(t, m, 'success'),
  error:   (t, m) => showToast(t, m, 'error'),
  info:    (t, m) => showToast(t, m, 'info'),
  warning: (t, m) => showToast(t, m, 'warning'),
};

// ─── MODALS ──────────────────────────────────────────────────────────

const _modals = {};

export function registerModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return null;
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(id); });
  _modals[id] = overlay;

  // ESC key closes topmost modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('show')) closeModal(id);
  });
  return overlay;
}

export function openModal(id)  { (_modals[id] || document.getElementById(id))?.classList.add('show'); }
export function closeModal(id) { (_modals[id] || document.getElementById(id))?.classList.remove('show'); }

export function confirmDialog(title, message, onConfirm, danger = true) {
  const id = '_confirm_modal';
  let overlay = document.getElementById(id);

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = id;
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal confirm-dialog">
        <div class="confirm-icon">⚠️</div>
        <div class="confirm-title"></div>
        <div class="confirm-message"></div>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:4px">
          <button class="btn btn-secondary" id="${id}-cancel">Cancel</button>
          <button class="btn" id="${id}-ok">Confirm</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('show'); });
  }

  overlay.querySelector('.confirm-title').textContent   = title;
  overlay.querySelector('.confirm-message').textContent = message;

  const okBtn     = overlay.querySelector(`#${id}-ok`);
  const cancelBtn = overlay.querySelector(`#${id}-cancel`);
  const newOk     = okBtn.cloneNode(true);
  const newCancel = cancelBtn.cloneNode(true);
  okBtn.replaceWith(newOk);
  cancelBtn.replaceWith(newCancel);

  newOk.className = `btn ${danger ? 'btn-danger' : 'btn-primary'}`;
  newOk.textContent = 'Confirm';
  newOk.addEventListener('click', () => { overlay.classList.remove('show'); onConfirm(); });
  newCancel.addEventListener('click', () => overlay.classList.remove('show'));

  overlay.classList.add('show');
}

// ─── LOADING ─────────────────────────────────────────────────────────

export function setButtonLoading(btn, loading) {
  if (loading) {
    btn.disabled = true;
    btn._origHTML = btn.innerHTML;
    btn.innerHTML = `<span class="loading-spinner"></span> Loading…`;
  } else {
    btn.disabled  = false;
    btn.innerHTML = btn._origHTML || btn.textContent;
  }
}

export function renderTableSkeleton(tbody, cols = 5, rows = 4) {
  tbody.innerHTML = Array.from({ length: rows }, () =>
    `<tr>${Array.from({ length: cols }, () =>
      `<td><div class="skeleton" style="height:13px;width:${55 + Math.random() * 40}%"></div></td>`
    ).join('')}</tr>`
  ).join('');
}

export function renderEmpty(container, icon, title, desc) {
  const isTable = container.tagName === 'TBODY';
  const cols = isTable ? container.closest('table')?.querySelectorAll('th').length || 5 : 1;
  const inner = `
    <div class="empty-state">
      <div class="empty-icon">${icon}</div>
      <div class="empty-title">${escapeHtml(title)}</div>
      <div class="empty-desc">${escapeHtml(desc)}</div>
    </div>`;
  container.innerHTML = isTable ? `<tr><td colspan="${cols}">${inner}</td></tr>` : inner;
}

// ─── FORM HELPERS ────────────────────────────────────────────────────

export function collectFormData(formEl) {
  const data = {};
  formEl.querySelectorAll('[name]').forEach(el => { data[el.name] = el.value.trim(); });
  return data;
}

export function resetForm(formEl) {
  formEl.reset();
  formEl.querySelectorAll('.form-control').forEach(el => el.classList.remove('error'));
  formEl.querySelectorAll('.form-error').forEach(el => el.classList.remove('show'));
}

export function fieldError(inputEl, errorEl, message) {
  inputEl.classList.add('error');
  if (errorEl) { errorEl.textContent = message; errorEl.classList.add('show'); }
}

export function fieldClear(inputEl, errorEl) {
  inputEl.classList.remove('error');
  if (errorEl) errorEl.classList.remove('show');
}

// ─── DOM UTILS ───────────────────────────────────────────────────────

export function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return String(iso); }
}

export function debounce(fn, delay = 280) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

export function statusBadge(status) {
  if (!status) return '—';
  return `<span class="badge badge-${status.toLowerCase()}">${escapeHtml(status)}</span>`;
}

export function roleBadge(role) {
  if (!role) return '—';
  return `<span class="badge badge-${role.toLowerCase()}">${escapeHtml(role.replace(/_/g, ' '))}</span>`;
}

/** Animate a counter number from 0 → target */
export function animateCounter(el, target, duration = 700) {
  const start = performance.now();
  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(progress * target);
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  };
  requestAnimationFrame(tick);
}
