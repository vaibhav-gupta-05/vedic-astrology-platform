'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import KundaliChart from '../components/KundaliChart';

const ZODIAC_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

const PLANET_ICONS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿',
  Jupiter: '♃', Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
};

const PLANET_COLORS: Record<string, string> = {
  Sun: '#f59e0b', Moon: '#e2e8f0', Mars: '#ef4444', Mercury: '#22c55e',
  Jupiter: '#f59e0b', Venus: '#ec4899', Saturn: '#6366f1', Rahu: '#64748b', Ketu: '#a78bfa',
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

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
    // Create date treating input as UTC so we can reliably subtract offset without local browser TZ interference
    let date = new Date(Date.UTC(formData.year, formData.month - 1, formData.day, hours, minutes));
    // Subtract offset in milliseconds to get actual UTC time
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

  return (
    <main className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '3rem 2rem', alignItems: 'center' }}>

      {/* Hero Section */}
      <div className="fade-in-up" style={{ textAlign: 'center', maxWidth: '700px', marginBottom: '3rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', opacity: 0.3 }}>☉</div>
        <h1 className="hero-title">Vedic Astrology Platform</h1>
        <p className="hero-subtitle" style={{ marginTop: '1rem' }}>
          Discover the profound insights of your cosmic blueprint through high-precision, hallucination-free astrological analysis.
        </p>
        <div className="zodiac-strip">
          {ZODIAC_SYMBOLS.map((z, i) => (
            <span key={i} style={{ transition: 'opacity 0.3s', cursor: 'default' }}
              onMouseOver={e => (e.currentTarget.style.opacity = '1')}
              onMouseOut={e => (e.currentTarget.style.opacity = '')}
            >{z}</span>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>

        {/* Input Form */}
        <div className="glass-panel fade-in-up stagger-1" style={{ flex: '1 1 420px', maxWidth: '500px' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ marginBottom: '0.25rem', fontSize: '1.3rem' }}>
              <span style={{ marginRight: '0.5rem', opacity: 0.6 }}>🕐</span>
              Enter Birth Details
            </h2>
            <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0 }}>Provide exact local birth time</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
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

            <div style={{ display: 'flex', gap: '0.75rem' }}>
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
              <label className="input-label">Place of Birth</label>
              <input
                type="text"
                className="input-field"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search for a city..."
                required
                style={selectedLocation ? { borderColor: 'var(--accent-emerald)', boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)' } : {}}
              />
              {isSearching && (
                <div style={{ position: 'absolute', right: '12px', top: '38px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className="cosmic-spinner-sm" style={{ color: 'var(--primary-gold)' }} />
                </div>
              )}

              {/* Autocomplete Dropdown */}
              {searchResults.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0,
                  background: 'var(--background-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  marginTop: '0.25rem',
                  zIndex: 50,
                  maxHeight: '200px',
                  overflowY: 'auto',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                  animation: 'fadeIn 0.2s ease-out'
                }}>
                  {searchResults.map((loc, idx) => (
                    <div
                      key={idx}
                      onClick={() => selectLocation(loc)}
                      style={{
                        padding: '0.75rem 1rem',
                        borderBottom: idx === searchResults.length - 1 ? 'none' : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        transition: 'all 0.2s ease',
                        color: 'var(--foreground-muted)',
                      }}
                      onMouseOver={e => { e.currentTarget.style.background = 'var(--primary-gold-dim)'; e.currentTarget.style.color = 'var(--foreground)'; }}
                      onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--foreground-muted)'; }}
                    >
                      <span style={{ marginRight: '0.5rem', opacity: 0.5 }}>📍</span>
                      {loc.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', padding: '1rem' }} disabled={loading}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span className="cosmic-spinner-sm" />
                  Calculating...
                </span>
              ) : (
                '✦ Generate Chart & Match Rules'
              )}
            </button>

            <Link href="/login">
              <button type="button" className="btn-outline" style={{ width: '100%' }}>
                Pandit Login (Admin)
              </button>
            </Link>
          </form>
        </div>

        {/* Results Panel */}
        {results && (
          <div className="fade-in-up" style={{ flex: '1 1 420px', maxWidth: '620px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Kundali Chart */}
            <div className="glass-panel-static" style={{ display: 'flex', justifyContent: 'center', padding: '2rem 1rem' }}>
              <KundaliChart
                planets={results.chart.planets}
                ascendantSign={results.chart.ascendant.sign}
                size={320}
              />
            </div>

            {/* Planet Grid */}
            <div className="glass-panel-static" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ opacity: 0.5 }}>🪐</span> Planetary Positions
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
                {Object.values(results.chart.planets).map((p: any, idx: number) => (
                  <div key={p.name} className={`planet-card fade-in-up stagger-${idx + 1}`}>
                    <div className="planet-icon" style={{ color: PLANET_COLORS[p.name] || '#e2e8f0' }}>
                      {PLANET_ICONS[p.name] || '⚝'}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: PLANET_COLORS[p.name] || '#e2e8f0' }}>{p.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginTop: '0.15rem' }}>{p.sign} · {p.degree.toFixed(1)}°</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', opacity: 0.7 }}>House {p.house}</div>
                    {p.isRetrograde && <span className="badge badge-rose" style={{ marginTop: '0.3rem' }}>↺ Retro</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Matched Rules */}
            <div className="glass-panel-static" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ opacity: 0.5 }}>✨</span> Matched Yogas & Doshas
              </h3>
              {results.matched_rules.length === 0 ? (
                <p className="text-muted" style={{ fontSize: '0.9rem', margin: 0 }}>
                  No specific Yogas or Doshas detected based on active rules.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {results.matched_rules.map((rule: any, idx: number) => (
                    <div key={rule.id} className={`matched-rule-card fade-in-up stagger-${idx + 1}`}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                        <span className="badge badge-gold">Yoga</span>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--primary-gold)' }}>{rule.name}</h4>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--foreground-muted)', lineHeight: 1.6 }}>{rule.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
