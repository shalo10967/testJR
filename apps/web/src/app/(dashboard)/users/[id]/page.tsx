'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, type ReqResUser, type SavedUser } from '@/lib/api';
import { Button } from '@/components/atoms/Button';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [reqResUser, setReqResUser] = useState<ReqResUser | null>(null);
  const [savedUser, setSavedUser] = useState<SavedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (Number.isNaN(id) || id < 1) {
      setError('Invalid user id');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all([
      api.getReqResUser(id).then((r) => r.data),
      api.getSavedUsers().then((users) => users.find((u) => u.reqResId === id) ?? null),
    ])
      .then(([reqRes, saved]) => {
        setReqResUser(reqRes);
        setSavedUser(saved);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave() {
    if (savedUser) return;
    setSaving(true);
    setError(null);
    try {
      const user = await api.importUser(id);
      setSavedUser(user);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-slate-500">Loading...</p>;
  if (error || !reqResUser)
    return (
      <div>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <Link href="/users" className="text-blue-600 hover:underline">
          Back to users
        </Link>
      </div>
    );

  return (
    <div>
      <Link href="/users" className="mb-4 inline-block text-blue-600 hover:underline">
        Back to users
      </Link>
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-4">
          {reqResUser.avatar && (
            <img
              src={reqResUser.avatar}
              alt=""
              className="h-20 w-20 rounded-full"
            />
          )}
          <div>
            <h1 className="text-2xl font-semibold">
              {reqResUser.first_name} {reqResUser.last_name}
            </h1>
            <p className="text-slate-600">{reqResUser.email}</p>
            {savedUser ? (
              <p className="mt-2 rounded bg-green-100 px-2 py-1 text-sm text-green-800">
                Saved locally
              </p>
            ) : (
              <Button
                className="mt-2"
                loading={saving}
                onClick={handleSave}
              >
                Save user locally
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
