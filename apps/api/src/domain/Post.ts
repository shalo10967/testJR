/**
 * Post entity (local only).
 */
export interface Post {
  id: string;
  title: string;
  body: string;
  authorUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePostInput {
  title: string;
  body: string;
  authorUserId: string;
}

export interface UpdatePostInput {
  title?: string;
  body?: string;
}
