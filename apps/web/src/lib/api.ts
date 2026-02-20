import { getToken } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? getToken() : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? 'Request failed';
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  return data as T;
}

export const api = {
  login: (email: string, password: string) =>
    apiFetch<{ token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getReqResUsers: (page: number) =>
    apiFetch<{ data: ReqResUser[]; page: number; total_pages: number }>(
      `/reqres/users?page=${page}`
    ),

  getReqResUser: (id: number) =>
    apiFetch<{ data: ReqResUser }>(`/reqres/users/${id}`),

  importUser: (reqResId: number) =>
    apiFetch<SavedUser>('/users/import/' + reqResId, { method: 'POST' }),

  getSavedUsers: () => apiFetch<SavedUser[]>('/users/saved'),

  getSavedUser: (id: string) => apiFetch<SavedUser | null>('/users/saved/' + id),

  deleteSavedUser: (id: string) =>
    apiFetch<void>('/users/saved/' + id, { method: 'DELETE' }),

  getPosts: () => apiFetch<Post[]>('/posts'),
  getPost: (id: string) => apiFetch<Post>(`/posts/${id}`),
  createPost: (body: { title: string; body: string; authorUserId: string }) =>
    apiFetch<Post>('/posts', { method: 'POST', body: JSON.stringify(body) }),
  updatePost: (id: string, body: { title?: string; body?: string }) =>
    apiFetch<Post>(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deletePost: (id: string) =>
    apiFetch<void>(`/posts/${id}`, { method: 'DELETE' }),
};

export interface ReqResUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

export interface SavedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  reqResId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  title: string;
  body: string;
  authorUserId: string;
  createdAt: string;
  updatedAt: string;
}
