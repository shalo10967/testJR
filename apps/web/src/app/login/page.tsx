'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/templates/AuthLayout';
import { LoginForm } from '@/components/organisms/LoginForm';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) router.replace('/users');
  }, [isAuthenticated, router]);

  function handleSuccess() {
    setError(null);
    router.replace('/users');
  }

  return (
    <AuthLayout title="Sign in">
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <LoginForm onSuccess={handleSuccess} onError={setError} />
    </AuthLayout>
  );
}
