'use client';
import { SessionProvider, useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

function AdminGate({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/';
    } else if (status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN') {
      // Students or non-admins are redirected to the student software
      window.location.href = '/kundli';
    }
  }, [status, session]);

  if (status === 'loading') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="fade-in" style={{ textAlign: 'center' }}>
          <div className="cosmic-spinner" style={{ margin: '0 auto 1.5rem' }} />
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>Verifying admin credentials...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || (session?.user as any)?.role !== 'ADMIN') {
    return null;
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', labelHi: 'डैशबोर्ड', icon: '📊' },
    { href: '/admin/rules/new', label: 'Create Rule', labelHi: 'नियम बनाएं', icon: '✦' },
  ];

  const userInitial = session?.user?.name?.charAt(0)?.toUpperCase() || 'P';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div>
          {/* Brand */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--primary-saffron), var(--kundali-gold))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.9rem', color: '#ffffff', fontWeight: 700
              }}>
                ॐ
              </div>
              <h2 style={{ color: 'var(--foreground)', margin: 0, fontSize: '1.1rem' }}>Pandit Portal</h2>
            </div>
            <p className="text-hindi text-muted" style={{ fontSize: '0.7rem', margin: '0.2rem 0 0 2.5rem' }}>पंडित पोर्टल</p>
          </div>

          {/* Navigation */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {navItems.map(item => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div className={`sidebar-nav-item ${isActive ? 'active' : ''}`}>
                    <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: '0.88rem' }}>{item.label}</div>
                      <div className="text-hindi" style={{ fontSize: '0.65rem', opacity: 0.5 }}>{item.labelHi}</div>
                    </div>
                  </div>
                </Link>
              );
            })}

            <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.6rem 0' }} />

            <Link href="/kundli">
              <div className="sidebar-nav-item" style={{ color: 'var(--primary-saffron)' }}>
                <span style={{ fontSize: '1rem' }}>🪐</span>
                <div>
                  <div style={{ fontSize: '0.88rem' }}>Kundli Software</div>
                  <div className="text-hindi" style={{ fontSize: '0.65rem', opacity: 0.5 }}>कुंडली गणना</div>
                </div>
              </div>
            </Link>
          </nav>
        </div>

        {/* User Section */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <div className="avatar">{userInitial}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {session?.user?.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--foreground-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {session?.user?.email}
              </div>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="btn-danger"
            style={{ width: '100%', padding: '0.5rem' }}
          >
            Logout / लॉगआउट
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem 2.5rem', position: 'relative', zIndex: 1, overflowY: 'auto', background: 'var(--background)' }}>
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminGate>{children}</AdminGate>
    </SessionProvider>
  );
}
