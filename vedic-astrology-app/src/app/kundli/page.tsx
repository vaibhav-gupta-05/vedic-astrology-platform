'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import KundaliChart from '@/components/KundaliChart';
import PanchangCard from '@/components/PanchangCard';
import AshtakavargaTable from '@/components/AshtakavargaTable';
import KarkamshaCard from '@/components/KarkamshaCard';

const ZODIAC_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

const PLANET_ICONS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿',
  Jupiter: '♃', Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
};

const PLANET_COLORS: Record<string, string> = {
  Sun: '#e07b39', Moon: '#4a90a4', Mars: '#dc2626', Mercury: '#16a34a',
  Jupiter: '#c49b00', Venus: '#d946a8', Saturn: '#6c3ec2', Rahu: '#64748b', Ketu: '#8b5cf6',
};

export default function KundliPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('lagna');

  const [formData, setFormData] = useState({
    year: 1990,
    month: 1,
    day: 1,
  });
  const [localTime, setLocalTime] = useState('12:00');
  const [timeZoneOffset, setTimeZoneOffset] = useState(5.5); // Default to IST

  // Autocomplete State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lon: number, display_name: string} | null>(null);

  // Debounced Search for OpenStreetMap
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2 && (!selectedLocation || searchQuery !== selectedLocation.display_name)) {
        setIsSearching(true);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5`);
          const data = await res.json();
          setSearchResults(data);
        } catch (err) {
          console.error("Geocoding search failed", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedLocation]);

  const selectLocation = (loc: any) => {
    setSelectedLocation({
      lat: parseFloat(loc.lat),
      lon: parseFloat(loc.lon),
      display_name: loc.display_name
    });
    setSearchQuery(loc.display_name);
    setSearchResults([]);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (selectedLocation && e.target.value !== selectedLocation.display_name) {
      setSelectedLocation(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation) {
      alert("Please search and select a specific place of birth from the dropdown.");
      return;
    }

    // Convert Local Time + TimeZone Offset to UTC
    const [hours, minutes] = localTime.split(':').map(Number);
    let date = new Date(Date.UTC(formData.year, formData.month - 1, formData.day, hours, minutes));
    date = new Date(date.getTime() - timeZoneOffset * 3600 * 1000);

    const utcYear = date.getUTCFullYear();
    const utcMonth = date.getUTCMonth() + 1;
    const utcDay = date.getUTCDate();
    const utcHourDecimal = date.getUTCHours() + date.getUTCMinutes() / 60;

    setLoading(true);
    setResults(null);

    try {
      const res = await fetch('/api/astrology/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: utcYear,
          month: utcMonth,
          day: utcDay,
          hour: utcHourDecimal,
          lat: selectedLocation.lat,
          lon: selectedLocation.lon
        })
      });

      const data = await res.json();
      if (res.ok) {
        setResults(data);
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if ((session as any)?.error === 'ConcurrentSessionRevoked') {
      alert("Notice / सूचना: Your account was signed into from another device. You have been logged out to protect student licenses.");
      window.location.href = '/';
    } else if (status === 'unauthenticated') {
      window.location.href = '/';
    }
  }, [status, session]);

  if (status === 'loading') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="fade-in" style={{ textAlign: 'center' }}>
          <div className="cosmic-spinner" style={{ margin: '0 auto 1.5rem' }} />
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>Verifying student license...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '2rem' }}>
        <div className="glass-panel fade-in-up" style={{ maxWidth: '420px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--primary-saffron)' }}>🔒</div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Student License Required</h2>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Please sign in with your student account to access Kundali generation and Pandit Ji&apos;s special combinations.
          </p>
          <Link href="/" className="btn-primary" style={{ display: 'inline-block', width: '100%' }}>
            Go to Login Page / लॉगिन करें
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '2rem', alignItems: 'center' }}>

      {/* Top Student Navigation / License Bar */}
      <header style={{
        width: '100%',
        maxWidth: '1200px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem 1.25rem',
        marginBottom: '2rem',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--card-shadow)',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary-saffron), var(--kundali-gold))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 'bold', fontSize: '1rem'
          }}>
            ॐ
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--foreground)' }}>
              Jyotish Vidya Software
            </div>
            <div className="text-hindi text-muted" style={{ fontSize: '0.7rem' }}>
              छात्र व ज्योतिष अनुसंधान संस्करण
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
            <span style={{
              background: (session?.user as any)?.role === 'ADMIN' ? 'rgba(230, 184, 0, 0.15)' : 'var(--primary-saffron-dim)',
              color: (session?.user as any)?.role === 'ADMIN' ? 'var(--kundali-gold-stroke)' : 'var(--primary-saffron)',
              border: '1px solid currentColor',
              padding: '2px 8px',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '0.72rem'
            }}>
              {(session?.user as any)?.role === 'ADMIN' ? '👑 Pandit Ji (Admin)' : '🎓 Student License'}
            </span>
            <span style={{ color: 'var(--foreground-muted)' }}>
              {session?.user?.name || session?.user?.email}
            </span>
          </div>

          {(session?.user as any)?.role === 'ADMIN' && (
            <Link
              href="/admin"
              style={{
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--primary-saffron)',
                border: '1px solid var(--border-color-hover)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.35rem 0.75rem',
                background: 'var(--primary-saffron-dim)'
              }}
            >
              ⚙️ Admin Portal
            </Link>
          )}

          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="btn-danger"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="fade-in-up" style={{ textAlign: 'center', maxWidth: '660px', marginBottom: '2.5rem', paddingTop: '0.5rem' }}>
        <h1 className="hero-title">
          <span style={{ color: 'var(--primary-saffron)' }}>ॐ</span> Precision Kundali Analysis
        </h1>
        <p className="hero-subtitle" style={{ marginTop: '0.75rem' }}>
          Deterministic Vedic astrological analysis powered by Swiss Ephemeris and Pandit Ji&apos;s proprietary rule matching.
        </p>
        <div className="zodiac-strip">
          {ZODIAC_SYMBOLS.map((z, i) => (
            <span key={i} style={{ transition: 'opacity 0.2s', cursor: 'default' }}
              onMouseOver={e => (e.currentTarget.style.opacity = '1')}
              onMouseOut={e => (e.currentTarget.style.opacity = '')}
            >{z}</span>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>

        {/* Input Form */}
        <div className="glass-panel fade-in-up stagger-1" style={{ flex: '1 1 400px', maxWidth: '480px' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ marginBottom: '0.2rem', fontSize: '1.2rem' }}>
              <span style={{ marginRight: '0.4rem', opacity: 0.5 }}>🕐</span>
              Enter Client Details
            </h2>
            <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0 }}>Provide exact local birth time</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <div style={{ flex: 1 }}>
                <label className="input-label">Year</label>
                <input type="number" className="input-field" value={formData.year}
                  onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="input-label">Month</label>
                <input type="number" className="input-field" min="1" max="12" value={formData.month}
                  onChange={e => setFormData({...formData, month: parseInt(e.target.value)})} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="input-label">Day</label>
                <input type="number" className="input-field" min="1" max="31" value={formData.day}
                  onChange={e => setFormData({...formData, day: parseInt(e.target.value)})} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <div style={{ flex: 1 }}>
                <label className="input-label">Local Time</label>
                <input type="time" className="input-field" value={localTime}
                  onChange={e => setLocalTime(e.target.value)} required />
              </div>
              <div style={{ flex: 1 }}>
                <label className="input-label">Time Zone</label>
                <select className="input-field" value={timeZoneOffset} onChange={e => setTimeZoneOffset(parseFloat(e.target.value))}>
                  <option value="-8">PST (UTC-8)</option>
                  <option value="-5">EST (UTC-5)</option>
                  <option value="0">UTC / GMT</option>
                  <option value="1">CET (UTC+1)</option>
                  <option value="4">GST (UTC+4)</option>
                  <option value="5.5">IST (UTC+5:30)</option>
                  <option value="8">SGT (UTC+8)</option>
                  <option value="9">JST (UTC+9)</option>
                  <option value="10">AEST (UTC+10)</option>
                </select>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <label className="input-label">Place of Birth (City / Town)</label>
              <input
                type="text"
                className="input-field"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search city (e.g. New Delhi, Mumbai, London)"
                required
              />

              {isSearching && (
                <div style={{ position: 'absolute', right: '12px', top: '38px' }}>
                  <div className="cosmic-spinner-sm" />
                </div>
              )}

              {searchResults.length > 0 && (
                <ul className="scale-in" style={{
                  position: 'absolute',
                  zIndex: 10,
                  width: '100%',
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--card-shadow-hover)',
                  marginTop: '0.25rem',
                  listStyle: 'none',
                  padding: '0.35rem 0',
                  maxHeight: '200px',
                  overflowY: 'auto',
                }}>
                  {searchResults.map((item, idx) => (
                    <li
                      key={idx}
                      onClick={() => selectLocation(item)}
                      style={{
                        padding: '0.6rem 1rem',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        borderBottom: idx < searchResults.length - 1 ? '1px solid var(--border-light)' : 'none',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseOver={e => (e.currentTarget.style.background = 'var(--primary-saffron-dim)')}
                      onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {item.display_name}
                    </li>
                  ))}
                </ul>
              )}

              {selectedLocation && (
                <p style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '0.35rem', margin: '0.35rem 0 0' }}>
                  ✓ Coordinates: {selectedLocation.lat.toFixed(4)}°, {selectedLocation.lon.toFixed(4)}°
                </p>
              )}
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }} disabled={loading}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span className="cosmic-spinner-sm" />
                  Calculating Ephemeris & Evaluating Rules...
                </span>
              ) : (
                '✦ Generate Chart & Match Rules'
              )}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        {results && (
          <div className="fade-in-up" style={{ flex: '1 1 420px', maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* ★ MATCHED RULES — TOP PRIORITY */}
            <div className="glass-panel-static" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--foreground)' }}>
                <span style={{ fontSize: '1.2rem' }}>🎯</span> Matched Yogas & Pandit Ji&apos;s Combinations
              </h3>
              {results.matched_rules.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 1rem', background: 'var(--background)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <p className="text-muted" style={{ fontSize: '0.9rem', margin: 0 }}>
                    No specific Yogas or Doshas detected based on active rules.
                  </p>
                  {(session?.user as any)?.role === 'ADMIN' && (
                    <p className="text-muted" style={{ fontSize: '0.8rem', margin: '0.5rem 0 0', opacity: 0.7 }}>
                      Add new rules via the <Link href="/admin" style={{ color: 'var(--primary-saffron)', fontWeight: 600 }}>Pandit Portal</Link>.
                    </p>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {results.matched_rules.map((rule: any, idx: number) => (
                    <div key={rule.id} className={`matched-rule-card fade-in-up stagger-${idx + 1}`}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <span className="badge badge-emerald">Matched</span>
                        <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--foreground)', fontWeight: 600 }}>{rule.name}</h4>
                      </div>
                      <p style={{ margin: '0 0 0.5rem', fontSize: '0.88rem', color: 'var(--foreground-muted)', lineHeight: 1.5 }}>{rule.description}</p>
                      
                      {/* Condition breakdown */}
                      {rule.conditions && rule.conditions.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                          {rule.conditions.map((cond: any, ci: number) => (
                            <span key={ci} className="condition-check">
                              ✓ {cond.entity} {cond.operator} {cond.value || ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* TABS */}
            <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.4rem', WebkitOverflowScrolling: 'touch' }}>
              {[
                { id: 'lagna', label: 'Lagna (D1)' },
                { id: 'chalit', label: 'Bhava Chalit' },
                { id: 'navamsha', label: 'Navamsha (D9)' },
                { id: 'panchang', label: 'Panchang' },
                { id: 'grah-sthiti', label: 'Grah Sthiti' },
                { id: 'ashtakavarga', label: 'Ashtakavarga' },
                { id: 'karkamsha', label: 'Karkamsha' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            {activeTab === 'lagna' && results.chart && (
              <div className="glass-panel-static fade-in-up" style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem 1rem' }}>
                <KundaliChart planets={results.chart.planets} ascendantSign={results.chart.ascendant.sign} size={310} />
              </div>
            )}

            {activeTab === 'chalit' && results.chalit_chart && (
              <div className="glass-panel-static fade-in-up" style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem 1rem' }}>
                <KundaliChart planets={results.chalit_chart.planets} ascendantSign={results.chalit_chart.ascendant.sign} size={310} />
              </div>
            )}

            {activeTab === 'navamsha' && results.navamsha_chart && (
              <div className="glass-panel-static fade-in-up" style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem 1rem' }}>
                <KundaliChart planets={results.navamsha_chart.planets} ascendantSign={results.navamsha_chart.ascendant.sign} size={310} />
              </div>
            )}

            {activeTab === 'panchang' && results.panchang && (
              <PanchangCard panchang={results.panchang} />
            )}

            {activeTab === 'ashtakavarga' && results.ashtakavarga && (
              <AshtakavargaTable ashtakavarga={results.ashtakavarga} />
            )}

            {activeTab === 'karkamsha' && results.karkamsha && (
              <KarkamshaCard karkamsha={results.karkamsha} />
            )}

            {activeTab === 'grah-sthiti' && (
              <div className="glass-panel-static fade-in-up" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '540px' }}>
                    <thead style={{ background: 'rgba(0,0,0,0.02)' }}>
                      <tr>
                        <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>Planet</th>
                        <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>Sign</th>
                        <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>Degree</th>
                        <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>Nakshatra</th>
                        <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>Lord</th>
                        <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>Pada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.values(results.grah_sthiti || results.chart.planets).map((p: any) => (
                        <tr key={p.name} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--foreground)' }}>
                            <span style={{ color: PLANET_COLORS[p.name] || '#000', marginRight: '0.4rem' }}>{PLANET_ICONS[p.name]}</span>
                            {p.name} {p.isRetrograde && <span style={{ color: 'var(--accent-rose)', fontSize: '0.8rem', marginLeft: '0.2rem' }}>[R]</span>}
                          </td>
                          <td style={{ padding: '1rem', color: 'var(--foreground-muted)' }}>{p.sign}</td>
                          <td style={{ padding: '1rem', color: 'var(--foreground-muted)', fontFamily: 'monospace' }}>{p.degree?.toFixed(2)}°</td>
                          <td style={{ padding: '1rem', color: 'var(--foreground-muted)' }}>{p.nakshatra || '—'}</td>
                          <td style={{ padding: '1rem', color: 'var(--foreground-muted)' }}>{p.nakshatra_lord || '—'}</td>
                          <td style={{ padding: '1rem', color: 'var(--foreground-muted)' }}>{p.nakshatra_pada || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
