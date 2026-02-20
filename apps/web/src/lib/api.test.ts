import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from './api';

describe('api', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('login sends POST to /auth/login', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ token: 'jwt-123' }),
    } as Response);

    const result = await api.login('a@b.com', 'pass');
    expect(result.token).toBe('jwt-123');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'a@b.com', password: 'pass' }),
      })
    );
  });

  it('getReqResUsers requests correct page', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [],
          page: 2,
          total_pages: 2,
        }),
    } as Response);

    await api.getReqResUsers(2);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\?page=2$/),
      expect.any(Object)
    );
  });
});
