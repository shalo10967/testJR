'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, type SavedUser } from '@/lib/api';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { FormField } from '@/components/molecules/FormField';

export default function NewPostPage() {
  const router = useRouter();
  const [savedUsers, setSavedUsers] = useState<SavedUser[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [authorUserId, setAuthorUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ title?: string; body?: string; author?: string }>({});

  useEffect(() => {
    api.getSavedUsers().then(setSavedUsers).catch(() => setSavedUsers([]));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err: typeof formErrors = {};
    if (!title.trim()) err.title = 'Title is required';
    if (!body.trim()) err.body = 'Body is required';
    if (!authorUserId) err.author = 'Select an author (save a user first)';
    if (Object.keys(err).length) {
      setFormErrors(err);
      return;
    }
    setFormErrors({});
    setLoading(true);
    setError(null);
    try {
      await api.createPost({ title: title.trim(), body: body.trim(), authorUserId });
      router.push('/posts');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Link href="/posts" className="mb-4 inline-block text-blue-600 hover:underline">
        Back to posts
      </Link>
      <h1 className="mb-4 text-2xl font-semibold">New post</h1>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {savedUsers.length === 0 && (
        <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          Save at least one user from the Users page before creating a post.
        </div>
      )}
      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        <FormField label="Title" error={formErrors.title}>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
          />
        </FormField>
        <FormField label="Body" error={formErrors.body}>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Content..."
            rows={5}
            className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.body ? 'border-red-500' : 'border-slate-300'
            }`}
          />
        </FormField>
        <FormField label="Author" error={formErrors.author}>
          <select
            value={authorUserId}
            onChange={(e) => setAuthorUserId(e.target.value)}
            className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.author ? 'border-red-500' : 'border-slate-300'
            }`}
          >
            <option value="">Select saved user</option>
            {savedUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.firstName} {u.lastName} ({u.email})
              </option>
            ))}
          </select>
        </FormField>
        <div className="flex gap-2">
          <Button type="submit" loading={loading}>
            Create post
          </Button>
          <Link href="/posts">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
