import { Router } from 'express';
import { importUserParamsSchema, savedUserIdParamsSchema } from '../validators/schemas.js';
import type { ImportUserUseCase } from '../../../../application/use-cases/ImportUserUseCase.js';
import type { GetSavedUsersUseCase } from '../../../../application/use-cases/GetSavedUsersUseCase.js';
import type { GetSavedUserUseCase } from '../../../../application/use-cases/GetSavedUserUseCase.js';
import type { DeleteSavedUserUseCase } from '../../../../application/use-cases/DeleteSavedUserUseCase.js';

export function createUsersRoutes(
  importUser: ImportUserUseCase,
  getSavedUsers: GetSavedUsersUseCase,
  getSavedUser: GetSavedUserUseCase,
  deleteSavedUser: DeleteSavedUserUseCase
): Router {
  const router = Router();

  router.post('/import/:id', async (req, res, next) => {
    try {
      const parsed = importUserParamsSchema.safeParse(req.params);
      if (!parsed.success) {
        res.status(400).json({ message: 'Invalid user id' });
        return;
      }
      const user = await importUser.execute(parsed.data.id);
      res.status(201).json(user);
    } catch (e) {
      next(e);
    }
  });

  router.get('/saved', async (_req, res, next) => {
    try {
      const users = await getSavedUsers.execute();
      res.json(users);
    } catch (e) {
      next(e);
    }
  });

  router.get('/saved/:id', async (req, res, next) => {
    try {
      const user = await getSavedUser.execute(req.params.id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.json(user);
    } catch (e) {
      next(e);
    }
  });

  router.delete('/saved/:id', async (req, res, next) => {
    try {
      const parsed = savedUserIdParamsSchema.safeParse(req.params);
      if (!parsed.success) {
        res.status(400).json({ message: 'Invalid id' });
        return;
      }
      await deleteSavedUser.execute(parsed.data.id);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  });

  return router;
}
