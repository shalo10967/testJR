import { Router } from 'express';
import { createPostSchema, updatePostSchema, postIdParamsSchema } from '../validators/schemas.js';
import type {
  CreatePostUseCase,
  GetPostsUseCase,
  GetPostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
} from '../../../../application/use-cases/PostsUseCases.js';

export function createPostsRoutes(
  createPost: CreatePostUseCase,
  getPosts: GetPostsUseCase,
  getPost: GetPostUseCase,
  updatePost: UpdatePostUseCase,
  deletePost: DeletePostUseCase
): Router {
  const router = Router();

  router.post('/', async (req, res, next) => {
    try {
      const parsed = createPostSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ message: parsed.error.flatten().fieldErrors });
        return;
      }
      const post = await createPost.execute(parsed.data);
      res.status(201).json(post);
    } catch (e) {
      next(e);
    }
  });

  router.get('/', async (_req, res, next) => {
    try {
      const posts = await getPosts.execute();
      res.json(posts);
    } catch (e) {
      next(e);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const parsed = postIdParamsSchema.safeParse(req.params);
      if (!parsed.success) {
        res.status(400).json({ message: 'Invalid id' });
        return;
      }
      const post = await getPost.execute(parsed.data.id);
      if (!post) {
        res.status(404).json({ message: 'Post not found' });
        return;
      }
      res.json(post);
    } catch (e) {
      next(e);
    }
  });

  router.put('/:id', async (req, res, next) => {
    try {
      const idParsed = postIdParamsSchema.safeParse(req.params);
      const bodyParsed = updatePostSchema.safeParse(req.body);
      if (!idParsed.success) {
        res.status(400).json({ message: 'Invalid id' });
        return;
      }
      if (!bodyParsed.success) {
        res.status(400).json({ message: bodyParsed.error.flatten().fieldErrors });
        return;
      }
      const post = await updatePost.execute(idParsed.data.id, bodyParsed.data);
      res.json(post);
    } catch (e) {
      next(e);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      const parsed = postIdParamsSchema.safeParse(req.params);
      if (!parsed.success) {
        res.status(400).json({ message: 'Invalid id' });
        return;
      }
      await deletePost.execute(parsed.data.id);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  });

  return router;
}
