import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSiteConfig } from '../../hooks/useSiteConfig';
import { login as loginApi } from '../../api/auth';
import { Dashboard } from './Dashboard';
import { Button } from '../../components/ui/Button';

export function AdminPage() {
  const { siteConfig, refetch } = useSiteConfig();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await loginApi(email, password);
      setToken(response.token);
    } catch {
      setError('Invalid credentials or server unavailable.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center px-4">
        <motion.div
          className="bg-[var(--color-surface)] rounded-2xl shadow-xl p-10 w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl text-[var(--color-text)] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Admin Login</h1>
          <p className="text-sm text-[var(--color-text)]/60 mb-8">Dolores Photography CMS</p>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-background)] text-[var(--color-text)] placeholder-[var(--color-text)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-background)] text-[var(--color-text)] placeholder-[var(--color-text)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
              required
            />
            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-xs text-[var(--color-text)]/40 mt-6">
            <a href="/" className="hover:text-[var(--color-primary)] transition-colors">← Back to site</a>
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <Dashboard
      siteConfig={siteConfig}
      token={token}
      onRefetch={refetch}
      onLogout={() => setToken(null)}
    />
  );
}
