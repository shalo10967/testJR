import { Router } from 'express';
import { loginSchema } from '../validators/schemas.js';
import type { LoginUseCase } from '../../../../application/use-cases/LoginUseCase.js';

const JWT_COOKIE_NAME = process.env.JWT_COOKIE_NAME ?? 'token';
const JWT_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function createAuthRoutes(loginUseCase: LoginUseCase): Router {
  const router = Router();

  router.post('/login', async (req, res, next) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ message: parsed.error.flatten().fieldErrors });
        return;
      }
      const { token } = await loginUseCase.execute(parsed.data.email, parsed.data.password);
      res.cookie(JWT_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: JWT_COOKIE_MAX_AGE_MS,
        path: '/',
      });
      res.json({ token });
    } catch (e) {
      next(e);
    }
  });

  return router;
}
