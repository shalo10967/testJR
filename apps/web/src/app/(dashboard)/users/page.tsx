'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { api, type ReqResUser, type SavedUser } from '@/lib/api';
import { Button } from '@/components/atoms/Button';

const SEARCH_DEBOUNCE_MS = 350;

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function matchSearch(u: ReqResUser, q: string): boolean {
  const lower = q.toLowerCase();
  return (
    u.first_name.toLowerCase().includes(lower) ||
    u.last_name.toLowerCase().includes(lower) ||
    u.email.toLowerCase().includes(lower)
  );
}

export default function UsersListPage() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ data: ReqResUser[]; total_pages: number } | null>(null);
  const [allUsers, setAllUsers] = useState<ReqResUser[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [savedUsers, setSavedUsers] = useState<SavedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.getReqResUsers(page),
      api.getSavedUsers().then(setSavedUsers),
    ])
      .then(([usersData]) => setData(usersData))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!debouncedSearch) {
      setAllUsers(null);
      return;
    }
    setSearchLoading(true);
    setError(null);
    api
      .getReqResUsers(1)
      .then((first) => {
        const totalPages = first.total_pages;
        const fetches = [Promise.resolve(first.data)];
        for (let p = 2; p <= totalPages; p++) {
          fetches.push(api.getReqResUsers(p).then((r) => r.data));
        }
        return Promise.all(fetches);
      })
      .then((pages) => setAllUsers(pages.flat()))
      .catch((e) => setError(e.message))
      .finally(() => setSearchLoading(false));
  }, [debouncedSearch]);

  const savedByReqResId = useMemo(
    () => new Map(savedUsers.map((s) => [s.reqResId, s])),
    [savedUsers]
  );

  const isSearchMode = debouncedSearch.length > 0;
  const usersFromSource = isSearchMode ? allUsers ?? [] : data?.data ?? [];
  const filtered = isSearchMode
    ? usersFromSource.filter((u) => matchSearch(u, debouncedSearch))
    : search.trim()
      ? usersFromSource.filter((u) => matchSearch(u, search))
      : usersFromSource;

  const showPagination =
    !isSearchMode &&
    data &&
    data.total_pages > 1 &&
    filtered.length > 0;
  const showEmptyState = !loading && !searchLoading && filtered.length === 0;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Users (ReqRes)</h1>
      <div className="mb-4 flex gap-2">
        <input
          type="search"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {(loading || (isSearchMode && searchLoading)) ? (
        <p className="text-slate-500">
          {isSearchMode && searchLoading ? 'Searching all pages...' : 'Loading users...'}
        </p>
      ) : showEmptyState ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
          {isSearchMode || search.trim() ? (
            <>
              <p className="font-medium">No users match your search.</p>
              <p className="mt-1 text-sm">Try another term or clear the search.</p>
            </>
          ) : (
            <p>No users on this page.</p>
          )}
        </div>
      ) : (
        <>
          {isSearchMode && (
            <p className="mb-3 text-sm text-slate-500">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''} across all pages
            </p>
          )}
          <ul className="space-y-2">
            {filtered.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center gap-3">
                  {u.avatar && (
                    <img
                      src={u.avatar}
                      alt=""
                      className="h-10 w-10 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium">
                      {u.first_name} {u.last_name}
                    </p>
                    <p className="text-sm text-slate-500">{u.email}</p>
                    {savedByReqResId.has(u.id) && (
                      <span className="mt-1 inline-block rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                        Saved locally
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {savedByReqResId.has(u.id) ? (
                    <>
                      <Link
                        href={`/users/${u.id}`}
                        className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        title="View detail"
                      >
                        <EyeIcon />
                      </Link>
                      <button
                        type="button"
                        onClick={async () => {
                          const saved = savedByReqResId.get(u.id);
                          if (!saved || !confirm('Remove this user from saved list?')) return;
                          setDeletingId(saved.id);
                          setError(null);
                          try {
                            await api.deleteSavedUser(saved.id);
                            setSavedUsers((prev) => prev.filter((s) => s.id !== saved.id));
                          } catch (e) {
                            setError(e instanceof Error ? e.message : 'Failed to remove');
                          } finally {
                            setDeletingId(null);
                          }
                        }}
                        disabled={deletingId !== null}
                        className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                        title="Remove from saved"
                      >
                        <TrashIcon />
                      </button>
                    </>
                  ) : (
                    <Link href={`/users/${u.id}`}>
                      <Button variant="secondary">View / Save</Button>
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {showPagination && (
            <div className="mt-4 flex justify-center gap-2">
              <Button
                variant="secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center px-2 text-sm text-slate-600">
                Page {page} of {data!.total_pages}
              </span>
              <Button
                variant="secondary"
                disabled={page >= data!.total_pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
