'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, type Post } from '@/lib/api';

export default function PostDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getPost(id)
      .then(setPost)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-slate-500">Loading...</p>;
  if (error || !post)
    return (
      <div>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <Link href="/posts" className="text-blue-600 hover:underline">
          Back to posts
        </Link>
      </div>
    );

  return (
    <div>
      <Link href="/posts" className="mb-4 inline-block text-blue-600 hover:underline">
        Back to posts
      </Link>
      <article className="rounded-lg border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold">{post.title}</h1>
        <p className="mt-2 text-sm text-slate-500">
          Author ID: {post.authorUserId} · Updated {new Date(post.updatedAt).toLocaleString()}
        </p>
        <div className="mt-4 whitespace-pre-wrap text-slate-700">{post.body}</div>
      </article>
      <div className="mt-4">
        <Link href={`/posts/${post.id}/edit`} className="text-blue-600 hover:underline">
          Edit post
        </Link>
      </div>
    </div>
  );
}
