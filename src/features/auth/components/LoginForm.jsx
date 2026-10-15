import { useState } from 'react';
import { Button, Input, Card } from '@/shared/ui';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '@/shared/lib/errors';

export function LoginForm({ onSuccess }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setPending(true);
    setError('');

    try {
      await signIn({ email, password });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="w-full max-w-sm p-6 sm:p-8">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold text-text">Staff Sign In</h2>
        <p className="text-sm text-muted mt-1">Star Enterprises Multi-Store Portal</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-2xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            {error}
          </div>
        )}

        <Input
          id="email"
          type="email"
          label="Staff Email"
          placeholder="staff@starenterprises.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          id="password"
          type="password"
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit" variant="solid" pending={pending} className="w-full mt-2">
          Sign In
        </Button>
      </form>
    </Card>
  );
}
