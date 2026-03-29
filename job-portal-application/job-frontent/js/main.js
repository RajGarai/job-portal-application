/**
 * main.js — App entry point
 * Navigation, routing, dashboard, global search
 */

import { initJobs, getAllJobs }  from './jobs.js';
import { initUsers }             from './users.js';
import { initApplications }      from './applications.js';
import { JobsAPI }               from './api.js';
import { animateCounter, escapeHtml } from './ui.js';

const initialized = {};

// ─── Navigation ───────────────────────────────────────────────────────
function navigateTo(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelector(`#page-${pageId}`)?.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`.nav-item[data-page="${pageId}"]`)?.classList.add('active');

  const titles = {
    dashboard:    '📊 Dashboard',
    jobs:         '💼 Job Listings',
    users:        '👤 Users',
    applications: '📋 Applications',
  };
  const titleEl = document.getElementById('topbar-title');
  if (titleEl) titleEl.textContent = titles[pageId] || 'JobPortal';

  if (!initialized[pageId]) {
    initialized[pageId] = true;
    switch (pageId) {
      case 'dashboard':    initDashboard();    break;
      case 'jobs':         initJobs();         break;
      case 'users':        initUsers();        break;
      case 'applications': initApplications(); break;
    }
  }

  // Close mobile sidebar
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebar-backdrop')?.classList.remove('show');

  history.replaceState(null, '', `#${pageId}`);
}

// ─── Dashboard ────────────────────────────────────────────────────────
async function initDashboard() {
  try {
    const res  = await JobsAPI.getAll();
    const jobs = res.data || [];

    // Animate counters
    const jobsEl  = document.getElementById('dash-total-jobs');
    const compEl  = document.getElementById('dash-companies');
    const locEl   = document.getElementById('dash-locations');

    const companies = new Set(jobs.map(j => j.companyName));
    const locations = new Set(jobs.map(j => j.location));

    animateCounter(jobsEl, jobs.length);
    animateCounter(compEl, companies.size);
    animateCounter(locEl,  locations.size);

    renderRecentJobs(jobs.slice(0, 6));
    renderCompanyBreakdown(jobs);
    renderTopLocations(jobs);
  } catch (err) {
    ['dash-total-jobs','dash-companies','dash-locations'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '—';
    });
    const tbody = document.getElementById('recent-jobs-body');
    if (tbody) tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--danger);padding:16px">⚠️ ${escapeHtml(err.message)}</td></tr>`;
  }
}

function renderRecentJobs(jobs) {
  const tbody = document.getElementById('recent-jobs-body');
  if (!tbody) return;
  if (!jobs.length) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:20px">No jobs yet — post the first one!</td></tr>`;
    return;
  }
  tbody.innerHTML = jobs.map(job => `
    <tr>
      <td class="td-primary">${escapeHtml(job.title)}</td>
      <td>${escapeHtml(job.companyName)}</td>
      <td>📍 ${escapeHtml(job.location)}</td>
      <td>${escapeHtml(job.postedBy?.name || '—')}</td>
    </tr>`).join('');
}

function renderCompanyBreakdown(jobs) {
  const container = document.getElementById('dash-companies-list');
  if (!container) return;

  const counts = {};
  jobs.forEach(j => { counts[j.companyName] = (counts[j.companyName] || 0) + 1; });
  const sorted = Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0,5);

  if (!sorted.length) { container.innerHTML = '<div style="color:var(--text-muted);font-size:0.82rem">No data yet</div>'; return; }

  const max = sorted[0][1];
  container.innerHTML = sorted.map(([name, count]) => `
    <div style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
        <span style="font-size:0.82rem;color:var(--text-primary);font-weight:500">${escapeHtml(name)}</span>
        <span style="font-size:0.75rem;color:var(--text-muted);font-family:var(--font-mono)">${count} job${count>1?'s':''}</span>
      </div>
      <div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden">
        <div style="height:100%;width:${(count/max)*100}%;background:linear-gradient(90deg,var(--accent),#a855f7);border-radius:3px;transition:width 0.8s ease"></div>
      </div>
    </div>`).join('');
}

function renderTopLocations(jobs) {
  const container = document.getElementById('dash-locations-list');
  if (!container) return;

  const counts = {};
  jobs.forEach(j => { counts[j.location] = (counts[j.location] || 0) + 1; });
  const sorted = Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0,5);

  if (!sorted.length) { container.innerHTML = '<div style="color:var(--text-muted);font-size:0.82rem">No data yet</div>'; return; }

  container.innerHTML = sorted.map(([loc, count]) => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
      <span style="font-size:0.82rem;color:var(--text-secondary)">📍 ${escapeHtml(loc)}</span>
      <span style="font-size:0.72rem;background:var(--accent-glow);color:var(--accent);padding:2px 8px;border-radius:10px;font-family:var(--font-mono)">${count}</span>
    </div>`).join('');
}

// ─── Global Search (topbar → syncs to jobs page search) ──────────────
function setupGlobalSearch() {
  const input = document.getElementById('global-search');
  if (!input) return;

  input.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    navigateTo('jobs');
    const jobSearch = document.getElementById('job-search');
    if (jobSearch) {
      jobSearch.value = input.value;
      jobSearch.dispatchEvent(new Event('input'));
      setTimeout(() => { input.value = ''; }, 100);
    }
  });
}

// ─── Mobile sidebar ───────────────────────────────────────────────────
function setupMobileSidebar() {
  document.getElementById('hamburger-btn')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.toggle('open');
    document.getElementById('sidebar-backdrop')?.classList.toggle('show');
  });
  document.getElementById('sidebar-backdrop')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('sidebar-backdrop')?.classList.remove('show');
  });
}

// ─── Boot ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.page));
  });

  setupMobileSidebar();
  setupGlobalSearch();

  const hash  = window.location.hash.slice(1);
  const pages = ['dashboard','jobs','users','applications'];
  navigateTo(pages.includes(hash) ? hash : 'dashboard');
});
