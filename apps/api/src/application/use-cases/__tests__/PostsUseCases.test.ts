import { describe, it, expect, vi } from 'vitest';
import {
  CreatePostUseCase,
  GetPostUseCase,
  UpdatePostUseCase,
  PostNotFoundError,
  AuthorNotFoundError,
} from '../PostsUseCases.js';

describe('CreatePostUseCase', () => {
  it('throws AuthorNotFoundError when author is not in DB', async () => {
    const postRepo = { create: vi.fn() };
    const userRepo = { findById: vi.fn().mockResolvedValue(null) };
    const useCase = new CreatePostUseCase(postRepo as any, userRepo as any);
    await expect(
      useCase.execute({ title: 'Hi', body: 'Body', authorUserId: 'unknown-id' })
    ).rejects.toThrow(AuthorNotFoundError);
    expect(postRepo.create).not.toHaveBeenCalled();
  });

  it('creates post when author exists', async () => {
    const saved = {
      id: 'user-1',
      email: 'a@b.com',
      firstName: 'A',
      lastName: 'B',
      reqResId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const created = {
      id: 'post-1',
      title: 'Hi',
      body: 'Body',
      authorUserId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const postRepo = { create: vi.fn().mockResolvedValue(created) };
    const userRepo = { findById: vi.fn().mockResolvedValue(saved) };
    const useCase = new CreatePostUseCase(postRepo as any, userRepo as any);
    const result = await useCase.execute({ title: 'Hi', body: 'Body', authorUserId: 'user-1' });
    expect(result).toEqual(created);
    expect(postRepo.create).toHaveBeenCalledWith({ title: 'Hi', body: 'Body', authorUserId: 'user-1' });
  });
});

describe('UpdatePostUseCase', () => {
  it('throws PostNotFoundError when post does not exist', async () => {
    const postRepo = { update: vi.fn().mockResolvedValue(null) };
    const useCase = new UpdatePostUseCase(postRepo as any);
    await expect(useCase.execute('missing-id', { title: 'New' })).rejects.toThrow(PostNotFoundError);
  });
});
