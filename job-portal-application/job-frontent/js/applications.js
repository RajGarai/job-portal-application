/**
 * applications.js — Applications page
 * Apply for jobs · view by user · view by job · filter by status
 */

import { ApplicationsAPI } from './api.js';
import {
  toast, openModal, closeModal, registerModal,
  setButtonLoading, renderTableSkeleton, renderEmpty,
  escapeHtml, formatDate, statusBadge, debounce,
} from './ui.js';

// ─── State ───────────────────────────────────────────────────────────
let currentApps = [];
let currentMode = ''; // 'user' | 'job'

// ─── Init ─────────────────────────────────────────────────────────────
export async function initApplications() {
  registerModal('apply-modal');
  setupApplyForm();
  setupSearch();
  setupStatusFilter();
}

// ─── Apply form ───────────────────────────────────────────────────────
function setupApplyForm() {
  document.getElementById('apply-job-btn')?.addEventListener('click', () => {
    document.getElementById('apply-form').reset();
    clearApplyErrors();
    openModal('apply-modal');
  });
  document.getElementById('apply-modal-close')?.addEventListener('click', () => closeModal('apply-modal'));

  document.getElementById('apply-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const jobId  = document.getElementById('apply-job-id').value.trim();
    const userId = document.getElementById('apply-user-id').value.trim();
    const btn    = document.getElementById('apply-submit-btn');

    let ok = true;
    if (!jobId || isNaN(Number(jobId)) || Number(jobId) < 1) {
      showApplyError('apply-job-id-error', 'Enter a valid Job ID');
      ok = false;
    } else clearApplyError('apply-job-id-error');

    if (!userId || isNaN(Number(userId)) || Number(userId) < 1) {
      showApplyError('apply-user-id-error', 'Enter a valid User ID');
      ok = false;
    } else clearApplyError('apply-user-id-error');

    if (!ok) return;

    setButtonLoading(btn, true);
    try {
      const res = await ApplicationsAPI.apply(Number(jobId), Number(userId));
      toast.success('Application submitted! ✓', `Status: ${res.data?.status || 'APPLIED'}`);
      closeModal('apply-modal');
    } catch (err) {
      toast.error('Application failed', err.message);
    } finally {
      setButtonLoading(btn, false);
    }
  });
}

function showApplyError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.classList.add('show'); }
}
function clearApplyError(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('show');
}
function clearApplyErrors() {
  ['apply-job-id-error', 'apply-user-id-error'].forEach(clearApplyError);
}

// ─── Lookup ────────────────────────────────────────────────────────────
function setupSearch() {
  document.getElementById('search-user-apps-btn')?.addEventListener('click', async () => {
    const id = document.getElementById('apps-user-id').value.trim();
    if (!id || isNaN(Number(id))) { toast.warning('Enter a valid User ID'); return; }
    await loadByUser(Number(id));
  });

  document.getElementById('search-job-apps-btn')?.addEventListener('click', async () => {
    const id = document.getElementById('apps-job-id').value.trim();
    if (!id || isNaN(Number(id))) { toast.warning('Enter a valid Job ID'); return; }
    await loadByJob(Number(id));
  });

  document.getElementById('apps-user-id')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('search-user-apps-btn').click();
  });
  document.getElementById('apps-job-id')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('search-job-apps-btn').click();
  });
}

function setupStatusFilter() {
  document.getElementById('apps-status-filter')?.addEventListener('change', () => {
    renderApps(applyStatusFilter(currentApps));
  });
}

// ─── Load ─────────────────────────────────────────────────────────────
async function loadByUser(userId) {
  currentMode = 'user';
  setTitle(`Applications by User #${userId}`);
  showLoading();
  try {
    const res  = await ApplicationsAPI.getByUser(userId);
    currentApps = res.data || [];
    updateBadge(currentApps.length);
    renderApps(applyStatusFilter(currentApps));
  } catch (err) {
    toast.error('Failed to load', err.message);
    renderEmpty(document.getElementById('apps-table-body'), '⚠️', 'Not found', err.message);
  }
}

async function loadByJob(jobId) {
  currentMode = 'job';
  setTitle(`Applicants for Job #${jobId}`);
  showLoading();
  try {
    const res  = await ApplicationsAPI.getByJob(jobId);
    currentApps = res.data || [];
    updateBadge(currentApps.length);
    renderApps(applyStatusFilter(currentApps));
  } catch (err) {
    toast.error('Failed to load', err.message);
    renderEmpty(document.getElementById('apps-table-body'), '⚠️', 'Not found', err.message);
  }
}

function applyStatusFilter(apps) {
  const filter = document.getElementById('apps-status-filter')?.value || '';
  return filter ? apps.filter(a => a.status === filter) : apps;
}

// ─── Render ───────────────────────────────────────────────────────────
function renderApps(apps) {
  const tbody = document.getElementById('apps-table-body');
  if (!tbody) return;

  if (!apps.length) {
    renderEmpty(tbody, '📋', 'No results', 'Try a different filter or ID.');
    return;
  }

  // Update column headers based on mode
  const col1 = document.getElementById('apps-col1');
  const col2 = document.getElementById('apps-col2');

  if (currentMode === 'user') {
    if (col1) col1.textContent = 'Job Title';
    if (col2) col2.textContent = 'Company';
    tbody.innerHTML = apps.map(app => `
      <tr>
        <td class="td-primary">${escapeHtml(app.job?.title || '—')}</td>
        <td>${escapeHtml(app.job?.companyName || '—')}</td>
        <td>${statusBadge(app.status)}</td>
        <td style="font-size:0.8rem">${formatDate(app.createAt)}</td>
      </tr>`).join('');
  } else {
    if (col1) col1.textContent = 'Applicant Name';
    if (col2) col2.textContent = 'Email';
    tbody.innerHTML = apps.map(app => `
      <tr>
        <td class="td-primary">${escapeHtml(app.userDTO?.name || '—')}</td>
        <td>${escapeHtml(app.userDTO?.email || '—')}</td>
        <td>${statusBadge(app.status)}</td>
        <td style="font-size:0.8rem">${formatDate(app.appliedAt)}</td>
      </tr>`).join('');
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────
function setTitle(t) {
  const el = document.getElementById('apps-section-title');
  if (el) el.textContent = t;
}

function showLoading() {
  renderTableSkeleton(document.getElementById('apps-table-body'), 4, 4);
}

function updateBadge(count) {
  const el = document.getElementById('apps-count');
  if (el) el.textContent = count;
}
