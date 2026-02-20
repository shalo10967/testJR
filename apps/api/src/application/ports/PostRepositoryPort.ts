import type { Post, CreatePostInput, UpdatePostInput } from '../../domain/Post.js';

/**
 * Port for post persistence (outbound).
 */
export interface PostRepositoryPort {
  create(input: CreatePostInput): Promise<Post>;
  findById(id: string): Promise<Post | null>;
  findAll(): Promise<Post[]>;
  update(id: string, input: UpdatePostInput): Promise<Post | null>;
  delete(id: string): Promise<boolean>;
}
