import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const importUserParamsSchema = z.object({
  id: z.string().transform((s) => parseInt(s, 10)).pipe(z.number().int().positive()),
});

export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  body: z.string().min(1, 'Body is required'),
  authorUserId: z.string().min(1, 'Author user ID is required'),
});

export const updatePostSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  body: z.string().min(1).optional(),
});

export const postIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const savedUserIdParamsSchema = z.object({
  id: z.string().min(1),
});
