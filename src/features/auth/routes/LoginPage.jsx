import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Button, Input, Badge } from '@/shared/ui';
import { Seo } from '@/shared/seo';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '@/shared/lib/errors';
import { Shield, Key, ArrowRight, UserCheck, Smartphone, Tv, ArrowLeft } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn, loginAsPersona } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function handleLoginSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your Gmail / staff email and password.');
      return;
    }

    setPending(true);
    setError('');

    try {
      const res = await signIn({ email, password });
      if (res?.redirectTo) {
        navigate(res.redirectTo);
      } else {
        navigate('/admin');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  }

  function handleQuickLogin(role) {
    const target = loginAsPersona(role);
    navigate(target);
  }

  return (
    <div className="py-12 sm:py-16 min-w-0">
      <Seo
        title="Staff & Admin Portal Login | Star Enterprises"
        description="Secure authentication portal for Star Enterprises store staff, managers, and owner administration."
        path="/login"
        noindex
      />

      <Container size="sm" className="space-y-6">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-text transition-colors"
        >
          <ArrowLeft size={14} /> Back to Public Storefront
        </Link>

        {/* Header */}
        <div className="text-center space-y-2">
          <Badge variant="accent" className="mb-1 text-xs">
            Star Enterprises Internal Access
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text">
            Staff & Owner Portal
          </h1>
          <p className="text-xs sm:text-sm text-muted max-w-sm mx-auto">
            Sign in with your registered credentials to access your store POS terminal, inventory, or management system.
          </p>
        </div>

        {/* Main Login Card */}
        <Card className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="rounded-2xl border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <Input
              id="login-email"
              type="email"
              label="Gmail / Staff Email Address"
              placeholder="e.g. owner@starenterprises.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              id="login-password"
              type="password"
              label="Password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="solid"
              pending={pending}
              className="w-full justify-center gap-2 text-xs py-2.5 cursor-pointer mt-2"
            >
              <Key size={14} /> Sign In to Workspace
            </Button>
          </form>

          {/* Quick-Fill & Demo Master Credentials */}
          <div className="pt-5 border-t border-border space-y-3">
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="font-semibold text-text flex items-center gap-1.5">
                <UserCheck size={14} /> Quick Demo Logins
              </span>
              <span>1-Click Sign-in</span>
            </div>

            <div className="space-y-2 text-xs">
              {/* Owner Quick Button */}
              <div className="p-3 border border-border rounded-xl bg-bg flex items-center justify-between gap-2 min-w-0">
                <div className="min-w-0">
                  <div className="font-semibold text-text flex items-center gap-1.5 truncate">
                    <Shield size={14} className="text-text shrink-0" />
                    <span>Store Owner (Full Access)</span>
                  </div>
                  <div className="text-[11px] text-muted font-mono truncate">
                    owner@starenterprises.com
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('owner')}
                  className="text-xs cursor-pointer shrink-0"
                >
                  Enter <ArrowRight size={12} />
                </Button>
              </div>

              {/* Mobiles Staff Quick Button */}
              <div className="p-3 border border-border rounded-xl bg-bg flex items-center justify-between gap-2 min-w-0">
                <div className="min-w-0">
                  <div className="font-semibold text-text flex items-center gap-1.5 truncate">
                    <Smartphone size={14} className="text-text shrink-0" />
                    <span>Star Mobiles Cashier</span>
                  </div>
                  <div className="text-[11px] text-muted font-mono truncate">
                    cashier.mobiles@starenterprises.com
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('mobiles_cashier')}
                  className="text-xs cursor-pointer shrink-0"
                >
                  Enter <ArrowRight size={12} />
                </Button>
              </div>

              {/* Furniture Staff Quick Button */}
              <div className="p-3 border border-border rounded-xl bg-bg flex items-center justify-between gap-2 min-w-0">
                <div className="min-w-0">
                  <div className="font-semibold text-text flex items-center gap-1.5 truncate">
                    <Tv size={14} className="text-text shrink-0" />
                    <span>Furniture Cashier</span>
                  </div>
                  <div className="text-[11px] text-muted font-mono truncate">
                    cashier.fe@starenterprises.com
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('fe_cashier')}
                  className="text-xs cursor-pointer shrink-0"
                >
                  Enter <ArrowRight size={12} />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
}
