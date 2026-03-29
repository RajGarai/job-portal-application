/**
 * api.js — Centralized API layer for JobPortal
 * Base: http://localhost:9090
 *
 * NOTE: The Spring Boot backend has no CORS configuration.
 * Add CorsConfig.java (provided in README) before using the frontend.
 */

const BASE_URL = 'http://localhost:9090';

/**
 * Core fetch wrapper — handles JSON parse + error extraction
 */
async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const config = {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  };

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkErr) {
    throw new Error('Cannot reach the backend. Is it running on port 9090?');
  }

  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; }
  catch { throw new Error(`Non-JSON response (HTTP ${response.status})`); }

  if (!response.ok || data.success === false) {
    throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return data; // { success, message, data }
}

// ─── JOBS ────────────────────────────────────────────────────────────
export const JobsAPI = {
  getAll:   ()            => apiFetch('/api/jobs'),
  getById:  (id)          => apiFetch(`/api/jobs/${id}`),
  create:   (payload)     => apiFetch('/api/jobs', { method: 'POST', body: JSON.stringify(payload) }),
  update:   (id, payload) => apiFetch(`/api/jobs/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  delete:   (id, userId)  => apiFetch(`/api/jobs/${id}/${userId}`, { method: 'DELETE' }),
};

// ─── USERS ───────────────────────────────────────────────────────────
export const UsersAPI = {
  register:   (payload) => apiFetch('/api/users/register', { method: 'POST', body: JSON.stringify(payload) }),
  getById:    (id)      => apiFetch(`/api/users/${id}`),
  getByEmail: (email)   => apiFetch(`/api/users/email/${encodeURIComponent(email)}`),
  update:     (id, payload) => apiFetch(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  delete:     (id)      => apiFetch(`/api/users/${id}`, { method: 'DELETE' }),
};

// ─── APPLICATIONS ─────────────────────────────────────────────────────
export const ApplicationsAPI = {
  apply:     (jobId, userId) => apiFetch(`/api/app/apply?jobId=${jobId}&userId=${userId}`, { method: 'POST' }),
  getByUser: (userId)        => apiFetch(`/api/app/user/${userId}`),
  getByJob:  (jobId)         => apiFetch(`/api/app/job/${jobId}`),
};
