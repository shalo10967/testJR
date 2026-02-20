'use client';

import { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { FormField } from '@/components/molecules/FormField';
import { useAuth } from '@/context/AuthContext';

interface LoginFormProps {
  onSuccess: () => void;
  onError: (message: string) => void;
}

export function LoginForm({ onSuccess, onError }: LoginFormProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err: typeof errors = {};
    if (!email.trim()) err.email = 'Email is required';
    if (!password) err.password = 'Password is required';
    if (Object.keys(err).length) {
      setErrors(err);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const { api } = await import('@/lib/api');
      const { token } = await api.login(email.trim(), password);
      login(token);
      onSuccess();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <FormField label="Email" error={errors.email}>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="eve.holt@reqres.in"
          autoComplete="email"
        />
      </FormField>
      <FormField label="Password" error={errors.password}>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </FormField>
      <Button type="submit" loading={loading} className="w-full">
        Sign in
      </Button>
    </form>
  );
}
