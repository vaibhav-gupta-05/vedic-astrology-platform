'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (res?.error) {
      setError('Invalid credentials. Please check your email and password.');
    } else {
      router.push('/admin');
    }
  };

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass-panel fade-in-up" style={{ maxWidth: '420px', width: '100%' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px', height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary-gold-dim), var(--accent-purple-dim))',
            border: '2px solid var(--primary-gold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem',
            fontSize: '1.8rem',
            animation: 'float 3s ease-in-out infinite',
          }}>
            ॐ
          </div>
          <h2 style={{ color: 'var(--primary-gold)', marginBottom: '0.25rem', fontSize: '1.5rem' }}>Pandit Portal</h2>
          <p className="text-muted text-hindi" style={{ fontSize: '0.85rem', margin: 0 }}>पंडित पोर्टल में प्रवेश करें</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="scale-in" style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: 'var(--accent-rose)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>⚠</span> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label className="input-label">Email Address</label>
            <input
              type="email"
              required
              className="input-field"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="pandit@astro.com"
            />
          </div>
          <div>
            <label className="input-label">Password</label>
            <input
              type="password"
              required
              className="input-field"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', padding: '0.9rem' }} disabled={loading}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span className="cosmic-spinner-sm" />
                Authenticating...
              </span>
            ) : (
              'Enter Portal'
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
          <a href="/" style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)' }}>
            ← Back to Public Site
          </a>
        </div>
      </div>
    </div>
  );
}
