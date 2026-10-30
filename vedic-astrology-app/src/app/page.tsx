'use client';
import { signIn, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingLoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showCredentialsForm, setShowCredentialsForm] = useState(false);

  // If already authenticated, redirect cleanly to appropriate portal
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const role = (session.user as any)?.role;
      if (role === 'ADMIN') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/kundli';
      }
    }
  }, [status, session]);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: cleanEmail,
        password: cleanPassword,
      });

      if (!res || res.error) {
        setLoading(false);
        setError('Invalid credentials. Please check your email and password.');
        return;
      }

      // Hard redirect to /auth-redirect so cookies are cleanly passed in request headers
      window.location.href = '/auth-redirect';
    } catch (err) {
      setLoading(false);
      setError('An unexpected error occurred during sign in.');
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    await signIn('google', { callbackUrl: '/auth-redirect' });
  };

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass-panel fade-in-up" style={{ maxWidth: '440px', width: '100%' }}>

        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '64px', height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary-saffron-dim), rgba(230, 184, 0, 0.15))',
            border: '2px solid var(--primary-saffron)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            fontSize: '1.9rem',
            color: 'var(--primary-saffron)',
            animation: 'float 3s ease-in-out infinite',
            boxShadow: '0 4px 16px rgba(224, 123, 57, 0.15)',
          }}>
            ॐ
          </div>
          <h2 style={{ color: 'var(--foreground)', marginBottom: '0.25rem', fontSize: '1.45rem', fontWeight: 700 }}>
            Jyotish Vidya Platform
          </h2>
          <p className="text-muted text-hindi" style={{ fontSize: '0.85rem', margin: 0 }}>
            वैदिक ज्योतिष अनुसंधान एवं विश्लेषण पोर्टल
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="scale-in" style={{
            background: 'rgba(220, 38, 38, 0.06)',
            border: '1px solid rgba(220, 38, 38, 0.25)',
            color: 'var(--accent-rose)',
            padding: '0.7rem 0.9rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            fontSize: '0.88rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            <span>⚠</span> {error}
          </div>
        )}

        {/* Option 1: Student Google Sign In */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem', textAlign: 'center' }}>
            Student Access / छात्र प्रवेश
          </div>
          <button
            id="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            style={{
              width: '100%',
              padding: '0.8rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: '#fff',
              color: '#3c4043',
              fontFamily: 'var(--font-main)',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: googleLoading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.65rem',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              transition: 'all 0.2s ease',
              opacity: googleLoading ? 0.7 : 1,
            }}
            onMouseOver={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 3px 10px rgba(0,0,0,0.12)'; }}
            onMouseOut={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.08)'; }}
          >
            {googleLoading ? (
              <span className="cosmic-spinner-sm" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
            )}
            {googleLoading ? 'Signing in...' : 'Continue with Google'}
          </button>
          <p style={{ textAlign: 'center', fontSize: '0.74rem', color: 'var(--foreground-muted)', marginTop: '0.45rem' }}>
            Students login directly with their Google Gmail account
          </p>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.5rem 0 1.25rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', whiteSpace: 'nowrap' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
        </div>

        {/* Option 2: Email & Password Credentials (Pandit Ji & Registered Students) */}
        {!showCredentialsForm ? (
          <div style={{ textAlign: 'center' }}>
            <button
              id="pandit-login-toggle"
              type="button"
              onClick={() => setShowCredentialsForm(true)}
              style={{
                background: 'var(--primary-saffron-dim)',
                border: '1px solid var(--border-color-hover)',
                borderRadius: 'var(--radius-md)',
                padding: '0.7rem 1.6rem',
                color: 'var(--primary-saffron)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
              }}
            >
              <span>🔐</span> Login with Email & Password
            </button>
            <p className="text-hindi" style={{ fontSize: '0.72rem', color: 'var(--foreground-muted)', marginTop: '0.4rem' }}>
              पंडित जी / पंजीकृत छात्र पासवर्ड लॉगिन
            </p>
          </div>
        ) : (
          <div className="scale-in">
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-saffron)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem', textAlign: 'center' }}>
              🔐 Account Login / खाता लॉगिन
            </div>

            <form onSubmit={handleCredentialsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="input-label">Email Address</label>
                <input
                  type="email"
                  required
                  className="input-field"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="pandit@astro.com or student@astro.com"
                  autoComplete="email"
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
                  autoComplete="current-password"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCredentialsForm(false)}
                  style={{
                    flex: 1, padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'transparent',
                    color: 'var(--foreground-muted)',
                    fontFamily: 'var(--font-main)',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 2, padding: '0.75rem' }}
                  disabled={loading}
                  id="pandit-submit-btn"
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <span className="cosmic-spinner-sm" />
                      Authenticating...
                    </span>
                  ) : 'Sign In / प्रवेश करें'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', margin: 0 }}>
            Powered by Swiss Ephemeris · Lahiri Ayanamsha · BPHS Ashtakavarga
          </p>
        </div>
      </div>
    </div>
  );
}
