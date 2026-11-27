'use client';

import { useCallback, useEffect, useState } from 'react';
import { AUTH_REQUIRED_EVENT, checkSession, login } from '@/lib/db';

type Status = 'checking' | 'out' | 'in';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('checking');
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    checkSession().then(ok => { if (!cancelled) setStatus(ok ? 'in' : 'out'); });
    return () => { cancelled = true; };
  }, []);

  // API が 401 を返したら (期限切れなど) ログイン画面に戻す
  useEffect(() => {
    const onAuthRequired = () => setStatus('out');
    window.addEventListener(AUTH_REQUIRED_EVENT, onAuthRequired);
    return () => window.removeEventListener(AUTH_REQUIRED_EVENT, onAuthRequired);
  }, []);

  const submit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const message = await login(user, password);
    setSubmitting(false);
    if (message) { setError(message); return; }
    setPassword('');
    setStatus('in');
  }, [user, password]);

  if (status === 'in') return <>{children}</>;
  if (status === 'checking') return null;

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: '#f8fafc' }}>
      <form
        onSubmit={submit}
        style={{ width: '100%', maxWidth: 340, background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,.08)', display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 800, textAlign: 'center', margin: 0 }}>マッチョ計画 💪</h1>
        <input
          type="text"
          name="username"
          autoComplete="username"
          placeholder="ユーザー名"
          value={user}
          onChange={e => setUser(e.target.value)}
          autoCapitalize="none"
          style={{ padding: '12px 14px', fontSize: 16, border: '1px solid #cbd5e1', borderRadius: 10 }}
        />
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="パスワード"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ padding: '12px 14px', fontSize: 16, border: '1px solid #cbd5e1', borderRadius: 10 }}
        />
        {error && <div style={{ color: '#ef4444', fontSize: 13 }}>{error}</div>}
        <button
          type="submit"
          disabled={submitting || !user || !password}
          style={{ padding: 12, fontSize: 16, fontWeight: 700, color: '#fff', background: '#2563eb', border: 'none', borderRadius: 10, opacity: submitting || !user || !password ? 0.6 : 1 }}
        >
          {submitting ? 'ログイン中…' : 'ログイン'}
        </button>
      </form>
    </div>
  );
}
