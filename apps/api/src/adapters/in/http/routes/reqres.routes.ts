import { Router } from 'express';
import type { ReqResClientPort } from '../../../../application/ports/ReqResClientPort.js';

export function createReqResProxyRoutes(reqRes: ReqResClientPort): Router {
  const router = Router();

  router.get('/users', async (req, res, next) => {
    try {
      const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
      const data = await reqRes.getUsers(page);
      res.json(data);
    } catch (e) {
      next(e);
    }
  });

  router.get('/users/:id', async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id) || id < 1) {
        res.status(400).json({ message: 'Invalid user id' });
        return;
      }
      const data = await reqRes.getUserById(id);
      res.json(data);
    } catch (e) {
      next(e);
    }
  });

  return router;
}
