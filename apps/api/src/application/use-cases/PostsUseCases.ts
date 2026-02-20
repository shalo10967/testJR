import type { PostRepositoryPort } from '../ports/PostRepositoryPort.js';
import type { UserRepositoryPort } from '../ports/UserRepositoryPort.js';
import type { Post, CreatePostInput, UpdatePostInput } from '../../domain/Post.js';

export class PostNotFoundError extends Error {
  constructor(public readonly id: string) {
    super(`Post ${id} not found`);
    this.name = 'PostNotFoundError';
  }
}

export class AuthorNotFoundError extends Error {
  constructor(public readonly authorUserId: string) {
    super(`Author user ${authorUserId} not found`);
    this.name = 'AuthorNotFoundError';
  }
}

/**
 * Create post (author must exist in DB or be a known ReqRes id - we accept any string for flexibility).
 */
export class CreatePostUseCase {
  constructor(
    private readonly postRepo: PostRepositoryPort,
    private readonly userRepo: UserRepositoryPort
  ) {}

  async execute(input: CreatePostInput): Promise<Post> {
    const byId = await this.userRepo.findById(input.authorUserId);
    if (!byId) {
      throw new AuthorNotFoundError(input.authorUserId);
    }
    return this.postRepo.create(input);
  }
}

export class GetPostsUseCase {
  constructor(private readonly postRepo: PostRepositoryPort) {}

  async execute(): Promise<Post[]> {
    return this.postRepo.findAll();
  }
}

export class GetPostUseCase {
  constructor(private readonly postRepo: PostRepositoryPort) {}

  async execute(id: string): Promise<Post | null> {
    return this.postRepo.findById(id);
  }
}

export class UpdatePostUseCase {
  constructor(private readonly postRepo: PostRepositoryPort) {}

  async execute(id: string, input: UpdatePostInput): Promise<Post> {
    const updated = await this.postRepo.update(id, input);
    if (!updated) throw new PostNotFoundError(id);
    return updated;
  }
}

export class DeletePostUseCase {
  constructor(private readonly postRepo: PostRepositoryPort) {}

  async execute(id: string): Promise<void> {
    const ok = await this.postRepo.delete(id);
    if (!ok) throw new PostNotFoundError(id);
  }
}
