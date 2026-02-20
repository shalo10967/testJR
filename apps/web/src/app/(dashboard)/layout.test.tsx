import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardRootLayout from './layout';

const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: vi.fn() }),
  usePathname: () => '/users',
}));

const mockUseAuth = vi.fn();
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('DashboardRootLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to /login when not authenticated', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
    render(
      <DashboardRootLayout>
        <span>Dashboard content</span>
      </DashboardRootLayout>
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login');
    });
  });

  it('renders dashboard content when authenticated', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, logout: vi.fn() });
    render(
      <DashboardRootLayout>
        <span>Dashboard content</span>
      </DashboardRootLayout>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard content')).toBeInTheDocument();
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
