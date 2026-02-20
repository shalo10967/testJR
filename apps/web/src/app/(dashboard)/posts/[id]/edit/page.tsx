'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { FormField } from '@/components/molecules/FormField';

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ title?: string; body?: string }>({});

  useEffect(() => {
    api
      .getPost(id)
      .then((p) => {
        setTitle(p.title);
        setBody(p.body);
      })
      .catch((e) => setLoadError(e.message));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err: { title?: string; body?: string } = {};
    if (!title.trim()) err.title = 'Title is required';
    if (!body.trim()) err.body = 'Body is required';
    if (Object.keys(err).length) {
      setFormErrors(err);
      return;
    }
    setFormErrors({});
    setLoading(true);
    setSubmitError(null);
    try {
      await api.updatePost(id, { title: title.trim(), body: body.trim() });
      router.push(`/posts/${id}`);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to update');
    } finally {
      setLoading(false);
    }
  }

  if (loadError)
    return (
      <div>
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {loadError}
        </div>
        <Link href="/posts" className="text-blue-600 hover:underline">
          Back to posts
        </Link>
      </div>
    );

  return (
    <div>
      <Link href={`/posts/${id}`} className="mb-4 inline-block text-blue-600 hover:underline">
        Back to post
      </Link>
      <h1 className="mb-4 text-2xl font-semibold">Edit post</h1>
      {submitError && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {submitError}
        </div>
      )}
      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        <FormField label="Title" error={formErrors.title}>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </FormField>
        <FormField label="Body" error={formErrors.body}>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.body ? 'border-red-500' : 'border-slate-300'
            }`}
          />
        </FormField>
        <div className="flex gap-2">
          <Button type="submit" loading={loading}>
            Save
          </Button>
          <Link href={`/posts/${id}`}>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
