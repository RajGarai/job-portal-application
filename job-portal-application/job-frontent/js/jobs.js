/**
 * jobs.js — Jobs page
 * CRUD operations for job listings.
 *
 * ⚠️  Backend rule: only users with role RECRUITER can create/update/delete jobs.
 *     The "Posted By (User ID)" field must be a RECRUITER's userId.
 */

import { JobsAPI, ApplicationsAPI } from './api.js';
import {
  toast, confirmDialog, openModal, closeModal, registerModal,
  setButtonLoading, renderTableSkeleton, renderEmpty,
  collectFormData, resetForm, fieldError,
  escapeHtml, formatDate, statusBadge, debounce, animateCounter,
} from './ui.js';

// ─── State ───────────────────────────────────────────────────────────
let allJobs     = [];
let editingJobId = null;
let viewMode     = 'grid'; // 'grid' | 'table'

// ─── Init ─────────────────────────────────────────────────────────────
export async function initJobs() {
  registerModal('job-modal');
  registerModal('applicants-modal');
  setupJobForm();
  setupSearch();
  setupViewToggle();
  await loadJobs();
}

// ─── Load all jobs ────────────────────────────────────────────────────
async function loadJobs() {
  showSkeletons();
  try {
    const res = await JobsAPI.getAll();
    allJobs = res.data || [];
    setJobsBadge(allJobs.length);
    render(allJobs);
  } catch (err) {
    toast.error('Failed to load jobs', err.message);
    const grid = document.getElementById('jobs-grid');
    if (grid) renderEmpty(grid, '⚠️', 'Backend unreachable', err.message);
  }
}

function showSkeletons() {
  const grid = document.getElementById('jobs-grid');
  if (grid && viewMode === 'grid') {
    grid.innerHTML = Array.from({ length: 6 }, () => `
      <div class="job-card" style="opacity:0.35;pointer-events:none">
        <div style="display:flex;gap:12px;margin-bottom:14px">
          <div class="skeleton" style="width:42px;height:42px;border-radius:8px;flex-shrink:0"></div>
          <div style="flex:1"><div class="skeleton" style="height:11px;width:55%;margin-bottom:6px"></div>
          <div class="skeleton" style="height:9px;width:35%"></div></div>
        </div>
        <div class="skeleton" style="height:16px;width:75%;margin-bottom:9px"></div>
        <div class="skeleton" style="height:11px;width:100%;margin-bottom:5px"></div>
        <div class="skeleton" style="height:11px;width:85%;margin-bottom:18px"></div>
        <div style="display:flex;gap:8px">
          <div class="skeleton" style="height:30px;width:90px;border-radius:6px"></div>
          <div class="skeleton" style="height:30px;width:60px;border-radius:6px"></div>
          <div class="skeleton" style="height:30px;width:36px;border-radius:6px"></div>
        </div>
      </div>`).join('');
  }
  const tbody = document.getElementById('jobs-table-body');
  if (tbody && viewMode === 'table') renderTableSkeleton(tbody, 5, 5);
}

// ─── Render dispatcher ────────────────────────────────────────────────
function render(jobs) {
  if (viewMode === 'grid') renderGrid(jobs);
  else renderTable(jobs);
}

// ─── Grid view ────────────────────────────────────────────────────────
function renderGrid(jobs) {
  const grid = document.getElementById('jobs-grid');
  if (!grid) return;

  if (!jobs.length) {
    renderEmpty(grid, '💼', 'No jobs found', 'Try a different search, or post a new listing.');
    return;
  }

  // Generate gradient index per company for colour variety
  const gradients = [
    'linear-gradient(135deg,#6c63ff,#a855f7)',
    'linear-gradient(135deg,#22d3a0,#38b6ff)',
    'linear-gradient(135deg,#f5a623,#ff5c7c)',
    'linear-gradient(135deg,#38b6ff,#6c63ff)',
    'linear-gradient(135deg,#a855f7,#ff5c7c)',
  ];

  grid.innerHTML = jobs.map((job, i) => {
    const grad   = gradients[i % gradients.length];
    const initial = (job.companyName || '?')[0].toUpperCase();
    const poster  = job.postedBy ? escapeHtml(job.postedBy.name) : '—';
    const posterId = job.postedBy?.userId || 0;

    return `
      <div class="job-card" data-id="${job.id}">
        <div class="job-card-company">
          <div class="company-logo" style="background:${grad}">${initial}</div>
          <div>
            <div class="company-name-text">${escapeHtml(job.companyName)}</div>
            <div class="job-card-id">#JOB-${String(job.id).padStart(4,'0')}</div>
          </div>
        </div>
        <div class="job-card-title">${escapeHtml(job.title)}</div>
        <div class="job-card-desc">${escapeHtml(job.description)}</div>
        <div class="job-card-meta">
          <span class="meta-tag">📍 ${escapeHtml(job.location)}</span>
          <span class="meta-tag">👤 ${poster}</span>
        </div>
        <div class="job-card-actions">
          <button class="btn btn-sm btn-success"   onclick="window._jobs.viewApplicants(${job.id})">👥 Applicants</button>
          <button class="btn btn-sm btn-secondary"  onclick="window._jobs.edit(${job.id})">✏️ Edit</button>
          <button class="btn btn-sm btn-danger"     onclick="window._jobs.del(${job.id}, ${posterId})">🗑</button>
        </div>
      </div>`;
  }).join('');
}

// ─── Table view ───────────────────────────────────────────────────────
function renderTable(jobs) {
  const tbody = document.getElementById('jobs-table-body');
  if (!tbody) return;

  if (!jobs.length) {
    renderEmpty(tbody, '💼', 'No jobs found', 'Post a new listing to get started.');
    return;
  }

  tbody.innerHTML = jobs.map(job => {
    const poster   = job.postedBy ? escapeHtml(job.postedBy.name) : '—';
    const posterId = job.postedBy?.userId || 0;
    return `
      <tr>
        <td class="td-primary">${escapeHtml(job.title)}</td>
        <td>${escapeHtml(job.companyName)}</td>
        <td><span class="meta-tag">📍 ${escapeHtml(job.location)}</span></td>
        <td>${poster}</td>
        <td>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <button class="btn btn-sm btn-success"  onclick="window._jobs.viewApplicants(${job.id})">👥</button>
            <button class="btn btn-sm btn-secondary" onclick="window._jobs.edit(${job.id})">✏️</button>
            <button class="btn btn-sm btn-danger"    onclick="window._jobs.del(${job.id}, ${posterId})">🗑</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

// ─── Search & filter ─────────────────────────────────────────────────
function setupSearch() {
  const doFilter = debounce(() => render(filterJobs()), 250);
  document.getElementById('job-search')?.addEventListener('input', doFilter);
  document.getElementById('location-filter')?.addEventListener('input', doFilter);
}

function filterJobs() {
  const q   = (document.getElementById('job-search')?.value || '').toLowerCase();
  const loc = (document.getElementById('location-filter')?.value || '').toLowerCase();
  return allJobs.filter(j => {
    const matchQ   = !q   || j.title.toLowerCase().includes(q)
                          || j.companyName.toLowerCase().includes(q)
                          || j.description.toLowerCase().includes(q);
    const matchLoc = !loc || j.location.toLowerCase().includes(loc);
    return matchQ && matchLoc;
  });
}

// ─── View toggle ─────────────────────────────────────────────────────
function setupViewToggle() {
  const gridBtn  = document.getElementById('view-grid');
  const tableBtn = document.getElementById('view-table');
  const gridView  = document.getElementById('jobs-grid-view');
  const tableView = document.getElementById('jobs-table-view');

  gridBtn?.addEventListener('click', () => {
    viewMode = 'grid';
    gridView.style.display  = '';
    tableView.style.display = 'none';
    gridBtn.classList.replace('btn-secondary', 'btn-primary');
    tableBtn.classList.replace('btn-primary', 'btn-secondary');
    render(filterJobs());
  });

  tableBtn?.addEventListener('click', () => {
    viewMode = 'table';
    gridView.style.display  = 'none';
    tableView.style.display = '';
    tableBtn.classList.replace('btn-secondary', 'btn-primary');
    gridBtn.classList.replace('btn-primary', 'btn-secondary');
    render(filterJobs());
  });
}

// ─── Job form (create / edit) ─────────────────────────────────────────
function setupJobForm() {
  const form      = document.getElementById('job-form');
  const submitBtn = document.getElementById('job-submit-btn');

  document.getElementById('add-job-btn')?.addEventListener('click', () => {
    editingJobId = null;
    resetForm(form);
    document.querySelector('#job-modal .modal-title').textContent = 'Post New Job';
    submitBtn.textContent = 'Post Job';
    openModal('job-modal');
  });

  document.getElementById('job-modal-close')?.addEventListener('click', () => closeModal('job-modal'));

  form?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateJobForm()) return;

    const d = collectFormData(form);
    const payload = {
      title:       d.title,
      description: d.description,
      location:    d.location,
      companyName: d.companyName,
      postedById:  Number(d.postedById),
    };

    setButtonLoading(submitBtn, true);
    try {
      if (editingJobId) {
        await JobsAPI.update(editingJobId, payload);
        toast.success('Job updated ✓', `"${payload.title}" has been saved.`);
      } else {
        await JobsAPI.create(payload);
        toast.success('Job posted ✓', `"${payload.title}" is now live.`);
      }
      closeModal('job-modal');
      resetForm(form);
      editingJobId = null;
      await loadJobs();
    } catch (err) {
      toast.error('Save failed', err.message);
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
}

function validateJobForm() {
  let ok = true;
  const rules = [
    ['job-title',     'job-title-error',    'Job title is required (max 100 chars)', v => v.length > 0 && v.length <= 100],
    ['job-description','job-desc-error',    'Description is required',               v => v.length > 0],
    ['job-location',  'job-location-error', 'Location is required (max 100 chars)',  v => v.length > 0 && v.length <= 100],
    ['job-company',   'job-company-error',  'Company name is required (max 25 chars)',v => v.length > 0 && v.length <= 25],
    ['job-poster-id', 'job-poster-error',   'Enter a valid recruiter User ID',        v => /^\d+$/.test(v) && Number(v) > 0],
  ];
  rules.forEach(([inputId, errId, msg, test]) => {
    const input = document.getElementById(inputId);
    const err   = document.getElementById(errId);
    if (!test(input.value.trim())) { fieldError(input, err, msg); ok = false; }
    else { input.classList.remove('error'); err?.classList.remove('show'); }
  });
  return ok;
}

// ─── Public action handlers (called via onclick) ──────────────────────
window._jobs = {
  edit: (id) => {
    const job = allJobs.find(j => j.id === id);
    if (!job) return;
    editingJobId = id;
    document.querySelector('#job-modal .modal-title').textContent = 'Edit Job';
    document.getElementById('job-submit-btn').textContent = 'Update Job';
    document.getElementById('job-title').value      = job.title || '';
    document.getElementById('job-description').value = job.description || '';
    document.getElementById('job-location').value   = job.location || '';
    document.getElementById('job-company').value    = job.companyName || '';
    document.getElementById('job-poster-id').value  = job.postedBy?.userId || '';
    openModal('job-modal');
  },

  del: (id, userId) => {
    const job = allJobs.find(j => j.id === id);
    confirmDialog(
      'Delete Job?',
      `Remove "${job?.title || 'this job'}"? This cannot be undone.`,
      async () => {
        try {
          await JobsAPI.delete(id, userId);
          toast.success('Job deleted', '');
          await loadJobs();
        } catch (err) {
          toast.error('Delete failed', err.message);
        }
      }
    );
  },

  viewApplicants: async (jobId) => {
    const job   = allJobs.find(j => j.id === jobId);
    const title = document.getElementById('applicants-job-title');
    const tbody = document.getElementById('applicants-list');

    if (title) title.textContent = `Applicants — ${job?.title || '#' + jobId}`;
    if (tbody) renderTableSkeleton(tbody, 4, 3);
    openModal('applicants-modal');

    try {
      const res  = await ApplicationsAPI.getByJob(jobId);
      const apps = res.data || [];

      if (!apps.length) {
        renderEmpty(tbody, '👥', 'No applicants yet', 'Share the listing to attract candidates.');
        return;
      }

      tbody.innerHTML = apps.map(app => `
        <tr>
          <td class="td-primary">${escapeHtml(app.userDTO?.name || '—')}</td>
          <td>${escapeHtml(app.userDTO?.email || '—')}</td>
          <td>${statusBadge(app.status)}</td>
          <td style="font-size:0.8rem">${formatDate(app.appliedAt)}</td>
        </tr>`).join('');
    } catch (err) {
      renderEmpty(tbody, '⚠️', 'Failed to load', err.message);
      toast.error('Could not load applicants', err.message);
    }
  },
};

// ─── Badge counter helper ─────────────────────────────────────────────
function setJobsBadge(count) {
  const el = document.getElementById('jobs-count');
  if (el) el.textContent = count;
}

// Export for dashboard use
export function getJobCount() { return allJobs.length; }
export function getAllJobs()  { return allJobs; }
