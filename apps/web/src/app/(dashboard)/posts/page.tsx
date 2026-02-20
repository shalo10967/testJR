'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, type Post } from '@/lib/api';
import { Button } from '@/components/atoms/Button';
import { isAdminUser } from '@/lib/auth';

type Tab = 'muro' | 'admin';

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('muro');
  const isAdmin = isAdminUser();

  function fetchPosts() {
    setLoading(true);
    setError(null);
    api
      .getPosts()
      .then(setPosts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('Delete this post?')) return;
    try {
      await api.deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Posts</h1>
        {isAdmin && (
          <Link href="/posts/new">
            <Button>New post</Button>
          </Link>
        )}
      </div>

      <div className="mb-6 flex flex-col items-center">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          View
        </p>
        <nav
          className="inline-flex gap-0 rounded-lg border-2 border-slate-300 bg-slate-100 p-1"
          aria-label="Posts view"
        >
          <button
            type="button"
            onClick={() => setTab('muro')}
            className={`rounded-md px-5 py-2.5 text-sm font-semibold transition ${
              tab === 'muro'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-transparent text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            Feed
          </button>
          <button
            type="button"
            onClick={() => setTab('admin')}
            className={`rounded-md px-5 py-2.5 text-sm font-semibold transition ${
              tab === 'admin'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-transparent text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            Manage posts
          </button>
        </nav>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-slate-500">Loading posts...</p>
      ) : posts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-500">
          <p className="mb-2">No posts yet.</p>
          {isAdmin && (
            <Link href="/posts/new" className="text-blue-600 hover:underline">
              Create the first one
            </Link>
          )}
        </div>
      ) : tab === 'muro' ? (
        <section className="space-y-6" aria-label="Posts feed">
          <div className="flex flex-col gap-6">
            {posts.map((p) => (
              <article
                key={p.id}
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <Link href={`/posts/${p.id}`} className="group block flex-1">
                  <h2 className="mb-2 text-lg font-semibold text-slate-900 group-hover:text-blue-600 group-hover:underline">
                    {p.title}
                  </h2>
                  <p className="mb-4 line-clamp-3 text-sm text-slate-600">
                    {p.body}
                  </p>
                </Link>
                <footer className="mt-auto border-t border-slate-100 pt-3 text-xs text-slate-400">
                  <time dateTime={p.updatedAt}>{formatDate(p.updatedAt)}</time>
                  <span className="mx-2">·</span>
                  <span>Author: {p.authorUserId}</span>
                </footer>
              </article>
            ))}
          </div>
        </section>
      ) : !isAdmin ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
          <p className="font-medium">Only the administrator can manage posts.</p>
          <p className="mt-1 text-sm">Use the &quot;Feed&quot; tab to view posts.</p>
        </div>
      ) : (
        <section aria-label="Posts to manage">
          <ul className="space-y-3">
            {posts.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="min-w-0 flex-1">
                  <Link href={`/posts/${p.id}`} className="font-medium text-slate-900 hover:underline">
                    {p.title}
                  </Link>
                  <p className="mt-1 text-sm text-slate-600 line-clamp-2">{p.body}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatDate(p.updatedAt)}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link href={`/posts/${p.id}/edit`}>
                    <Button variant="secondary">Edit</Button>
                  </Link>
                  <Button variant="danger" onClick={() => handleDelete(p.id)}>
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
