const TOKEN_KEY = 'testjr_token';
const ADMIN_EMAIL = 'eve.holt@reqres.in';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Decodes JWT payload (no verification; used only to read sub/email on client).
 */
export function getCurrentUserEmail(): string | null {
  const token = getToken();
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = atob(padded);
    const payload = JSON.parse(json) as { sub?: string };
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

export function isAdminUser(): boolean {
  const email = getCurrentUserEmail();
  return email?.toLowerCase().trim() === ADMIN_EMAIL;
}
