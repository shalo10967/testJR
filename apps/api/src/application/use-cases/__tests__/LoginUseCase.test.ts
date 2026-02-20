import { describe, it, expect, vi } from 'vitest';
import { LoginUseCase } from '../LoginUseCase.js';

describe('LoginUseCase', () => {
  it('returns a JWT when ReqRes login succeeds', async () => {
    const reqRes = {
      login: vi.fn().mockResolvedValue({ token: 'reqres-token' }),
    };
    const useCase = new LoginUseCase(reqRes as any, 'secret', '1h');
    const result = await useCase.execute('eve.holt@reqres.in', 'cityslicka');
    expect(result.token).toBeDefined();
    expect(typeof result.token).toBe('string');
    expect(result.token.split('.')).toHaveLength(3);
    expect(reqRes.login).toHaveBeenCalledWith('eve.holt@reqres.in', 'cityslicka');
  });

  it('throws when ReqRes login fails', async () => {
    const reqRes = {
      login: vi.fn().mockRejectedValue(new Error('user not found')),
    };
    const useCase = new LoginUseCase(reqRes as any, 'secret', '1h');
    await expect(useCase.execute('bad@example.com', 'wrong')).rejects.toThrow('user not found');
  });
});
