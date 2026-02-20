import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from './LoginForm';
import { AuthProvider } from '@/context/AuthContext';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    login: vi.fn(),
    getReqResUsers: vi.fn(),
    getReqResUser: vi.fn(),
    importUser: vi.fn(),
    getSavedUsers: vi.fn(),
    getSavedUser: vi.fn(),
    getPosts: vi.fn(),
    getPost: vi.fn(),
    createPost: vi.fn(),
    updatePost: vi.fn(),
    deletePost: vi.fn(),
  },
}));

function renderWithAuth(ui: React.ReactElement) {
  return render(ui, {
    wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
  });
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows validation errors when submitting with empty fields', async () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    renderWithAuth(<LoginForm onSuccess={onSuccess} onError={onError} />);

    const submitBtn = await screen.findByRole('button', { name: /sign in/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    expect(api.login).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('calls onError when login API fails', async () => {
    vi.mocked(api.login).mockRejectedValueOnce(new Error('Invalid credentials'));
    const onSuccess = vi.fn();
    const onError = vi.fn();
    renderWithAuth(<LoginForm onSuccess={onSuccess} onError={onError} />);

    await screen.findByRole('button', { name: /sign in/i });
    fireEvent.change(screen.getByPlaceholderText(/eve\.holt@reqres\.in/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('Invalid credentials');
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('calls onSuccess when login succeeds', async () => {
    vi.mocked(api.login).mockResolvedValueOnce({ token: 'jwt-123' });
    const onSuccess = vi.fn();
    const onError = vi.fn();
    renderWithAuth(<LoginForm onSuccess={onSuccess} onError={onError} />);

    await screen.findByRole('button', { name: /sign in/i });
    fireEvent.change(screen.getByPlaceholderText(/eve\.holt@reqres\.in/i), {
      target: { value: 'eve.holt@reqres.in' },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/), {
      target: { value: 'cityslicka' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(api.login).toHaveBeenCalledWith('eve.holt@reqres.in', 'cityslicka');
    });
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
    expect(onError).not.toHaveBeenCalled();
  });
});
