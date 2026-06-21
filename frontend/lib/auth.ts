import backend from '~backend/client';

export function getToken(): string | null {
  return localStorage.getItem('cafe_token');
}

export function setToken(token: string): void {
  localStorage.setItem('cafe_token', token);
}

export function removeToken(): void {
  localStorage.removeItem('cafe_token');
}

export function getAuthenticatedBackend() {
  const token = getToken();
  if (!token) return backend;
  return backend.with({
    auth: async () => ({ authorization: `Bearer ${token}` }),
  });
}

export function getStoredUser(): { name: string; email: string; role: string } | null {
  const raw = localStorage.getItem('cafe_user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function setStoredUser(user: { name: string; email: string; role: string }): void {
  localStorage.setItem('cafe_user', JSON.stringify(user));
}

export function removeStoredUser(): void {
  localStorage.removeItem('cafe_user');
}
