'use client';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function AuthRedirectPage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'authenticated' && session?.user) {
      const role = (session.user as any)?.role;
      if (role === 'ADMIN') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/kundli';
      }
    } else if (status === 'unauthenticated') {
      window.location.href = '/';
    }
  }, [status, session]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      gap: '1.25rem',
      background: 'var(--background)'
    }}>
      <div className="cosmic-spinner" />
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.15rem', color: 'var(--foreground)', marginBottom: '0.25rem' }}>
          Redirecting to Portal...
        </h3>
        <p className="text-muted text-hindi" style={{ fontSize: '0.82rem', margin: 0 }}>
          कृपया प्रतीक्षा करें...
        </p>
      </div>
    </div>
  );
}
