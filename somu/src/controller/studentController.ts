// src/controller/studentController.ts
import { requireLogin } from './auth'

const BACKEND = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8080'

async function fetchWithAuth(path: string, opts: RequestInit = {}) {
  const options: RequestInit = {
    credentials: 'include', // important: include cookies from backend session
    headers: { 'Content-Type': 'application/json' },
    ...opts
  };

  try {
    const resp = await fetch(`${BACKEND}${path}`, options);

    // If backend returns 401 or 403 (not authenticated), trigger login flow
    if (resp.status === 401 || resp.status === 403) {
      // session expired or not logged in -> redirect user to login
      requireLogin();
      return Promise.reject(new Error('Not authenticated'));
    }

    // If server returned redirect (302) to login page, the browser's fetch
    // may follow it but it will be CORS-blocked. We treat non-2xx as error.
    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      return Promise.reject(new Error(`Fetch ${path} failed: ${resp.status} ${resp.statusText} ${text}`));
    }

    // If response has JSON
    const contentType = resp.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) return resp.json();
    return resp.text();
  } catch (err) {
    // network error or CORS error; surface a helpful message
    console.error('fetchWithAuth error', err);
    return Promise.reject(err);
  }
}

// API functions used by MainPage
export async function getStudentDetails() {
  return fetchWithAuth('/api/getstudentdetails');
}

export async function getDomains() {
  return fetchWithAuth('/api/domains');
}

// edit student using PUT /api/editstudent
export async function editStudent(student: any) {
  return fetchWithAuth('/api/editstudent', {
    method: 'PUT',
    body: JSON.stringify(student)
  });
}

// helpers/types (adapt to your existing Student/Domain types)
export type Domain = {
  domainId: number;
  program: string;
  batch: string;
  qualification?: string;
  capacity?: number;
}

export type Student = {
  studentId?: number;
  rollNo?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  photographPath?: string;
  photograph_path?: string;
  cgpa?: number | string;
  totalCredits?: number;
  graduationYear?: number;
  domain?: Domain | string | number | null;
}

/**
 * Helper: returns a human-readable label for a domain.
 * Accepts:
 *  - undefined -> returns '-'
 *  - string -> returns the string
 *  - object with program/batch -> returns "Program (Batch)"
 */
export function getDomainDisplay(domain: string | { program?: string; batch?: string } | undefined): string {
  if (!domain) return '-';
  if (typeof domain === 'string') return domain;
  const prog = (domain.program ?? '').toString();
  const batch = (domain.batch ?? '').toString();
  if (prog === '' && batch === '') return '-';
  if (batch === '') return prog;
  if (prog === '') return batch;
  return `${prog} (${batch})`;
}
