/**
 * GMC NEXUS API — optional backend. Dashboard runs fully without it.
 * Only when VITE_NEXUS_URL is set do we call NEXUS (reports, chat).
 */

const NEXUS_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_NEXUS_URL?.trim()) || '';

/** True only when NEXUS URL is explicitly configured. Dashboard is detached otherwise. */
export function isNexusEnabled() {
  return NEXUS_BASE.length > 0;
}

const LOCAL_LOGIN = NEXUS_BASE ? `${NEXUS_BASE}/api/auth/local-login` : '';

async function ensureAuth() {
  if (!LOCAL_LOGIN) return;
  try {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = LOCAL_LOGIN;
    document.body.appendChild(iframe);
    await new Promise((r) => setTimeout(r, 1500));
    document.body.removeChild(iframe);
  } catch (_) {
    window.location.href = LOCAL_LOGIN;
  }
}

export async function nexusFetch(path, options = {}) {
  if (!NEXUS_BASE) return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
  const url = path.startsWith('http') ? path : `${NEXUS_BASE}${path}`;
  const opts = { ...options, credentials: 'include' };
  let res = await fetch(url, opts);
  if (res.status === 401) {
    await ensureAuth();
    res = await fetch(url, opts);
  }
  return res;
}

export function trpcInput(input) {
  return { 0: { json: input } };
}

export async function trpcGet(procedure, input) {
  if (!NEXUS_BASE) return [];
  const batch = encodeURIComponent(JSON.stringify(trpcInput(input)));
  const res = await nexusFetch(`/api/trpc/${procedure}?batch=1&input=${batch}`);
  if (!res.ok) throw new Error(`tRPC ${procedure} ${res.status}`);
  const data = await res.json();
  return data;
}

export async function trpcPost(procedure, jsonBody) {
  if (!NEXUS_BASE) throw new Error('NEXUS not configured');
  const body = JSON.stringify(trpcInput(jsonBody));
  const res = await nexusFetch(`/api/trpc/${procedure}?batch=1`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  if (!res.ok) throw new Error(`tRPC ${procedure} ${res.status}`);
  return res.json();
}

export async function uploadReportPdf(file, { title, reportDate, reportType }) {
  if (!NEXUS_BASE) throw new Error('NEXUS not configured');
  const params = new URLSearchParams({
    title: title || file.name,
    filename: file.name,
    reportDate: reportDate || new Date().toISOString().slice(0, 10),
    reportType: reportType || 'macro',
  });
  const res = await nexusFetch(`/api/reports/upload-pdf?${params}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/pdf' },
    body: file,
  });
  if (!res.ok) throw new Error(`Upload ${res.status}`);
  return res.json();
}
