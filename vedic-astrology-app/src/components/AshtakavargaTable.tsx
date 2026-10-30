'use client';

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const ZODIAC_SHORT = [
  'Ar', 'Ta', 'Ge', 'Ca', 'Le', 'Vi', 'Li', 'Sc', 'Sa', 'Cp', 'Aq', 'Pi'
];

const PLANET_COLORS: Record<string, string> = {
  Sun: '#e07b39', Moon: '#4a90a4', Mars: '#dc2626', Mercury: '#16a34a',
  Jupiter: '#c49b00', Venus: '#d946a8', Saturn: '#6c3ec2',
};

interface AshtakavargaData {
  bav: Record<string, number[]>;
  sav: number[];
  sav_total: number;
  bav_totals: Record<string, number>;
}

interface Props {
  ashtakavarga: AshtakavargaData;
}

const PLANETS_ORDER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

function getBinduColor(score: number): string {
  if (score >= 6) return '#16a34a';    // Strong — green
  if (score >= 4) return '#c49b00';    // Average — gold
  if (score >= 2) return '#e07b39';    // Weak — orange
  return '#dc2626';                     // Very weak — red
}

function getBinduBg(score: number): string {
  if (score >= 6) return 'rgba(22,163,74,0.08)';
  if (score >= 4) return 'rgba(196,155,0,0.08)';
  if (score >= 2) return 'rgba(224,123,57,0.08)';
  return 'rgba(220,38,38,0.06)';
}

export default function AshtakavargaTable({ ashtakavarga }: Props) {
  if (!ashtakavarga) return null;
  const { bav, sav, sav_total, bav_totals } = ashtakavarga;

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* BAV Grid */}
      <div className="glass-panel-static" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
            Bhinnashtakavarga (BAV)
          </h3>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>
            Individual planet scores across the 12 signs (0–8 bindus each)
          </p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', minWidth: '600px' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', textAlign: 'left', fontWeight: 600, minWidth: '80px' }}>Planet</th>
                {ZODIAC_SHORT.map((z, i) => (
                  <th key={i} style={{ padding: '0.6rem 0.4rem', borderBottom: '1px solid var(--border-color)', fontWeight: 500, fontSize: '0.78rem', color: 'var(--foreground-muted)' }}>
                    {z}
                  </th>
                ))}
                <th style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-color)', fontWeight: 700, fontSize: '0.82rem' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {PLANETS_ORDER.map((planet) => {
                const scores = bav[planet] || [];
                const color = PLANET_COLORS[planet] || '#64647a';
                return (
                  <tr key={planet} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color }}>
                      {planet}
                    </td>
                    {scores.map((score, idx) => (
                      <td key={idx} style={{
                        padding: '0.5rem 0.3rem',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        color: getBinduColor(score),
                        background: getBinduBg(score),
                      }}>
                        {score}
                      </td>
                    ))}
                    <td style={{ padding: '0.75rem', fontWeight: 700, color, background: 'rgba(0,0,0,0.02)' }}>
                      {bav_totals[planet]}
                    </td>
                  </tr>
                );
              })}

              {/* SAV Row */}
              <tr style={{ background: 'rgba(224,123,57,0.05)', borderTop: '2px solid var(--border-color)' }}>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'left', fontWeight: 700, color: 'var(--primary-saffron)' }}>
                  SAV
                </td>
                {sav.map((score, idx) => (
                  <td key={idx} style={{
                    padding: '0.5rem 0.3rem',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: score >= 28 ? '#16a34a' : score >= 20 ? '#c49b00' : '#dc2626',
                  }}>
                    {score}
                  </td>
                ))}
                <td style={{ padding: '0.85rem', fontWeight: 800, color: 'var(--primary-saffron)', fontSize: '1rem' }}>
                  {sav_total}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Sign Labels Row */}
      <div className="glass-panel-static" style={{ padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--foreground-muted)', marginRight: '0.5rem' }}>Signs:</span>
          {ZODIAC_SIGNS.map((sign, i) => (
            <span key={i} style={{ fontSize: '0.78rem', padding: '0.15rem 0.5rem', background: 'var(--background)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--foreground-muted)' }}>
              <strong>{ZODIAC_SHORT[i]}</strong> = {sign}
            </span>
          ))}
        </div>
        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {[{ label: '6–8: Strong', color: '#16a34a', bg: 'rgba(22,163,74,0.08)' }, { label: '4–5: Average', color: '#c49b00', bg: 'rgba(196,155,0,0.08)' }, { label: '2–3: Weak', color: '#e07b39', bg: 'rgba(224,123,57,0.08)' }, { label: '0–1: Very Weak', color: '#dc2626', bg: 'rgba(220,38,38,0.06)' }].map(item => (
            <span key={item.label} style={{ fontSize: '0.78rem', padding: '0.15rem 0.6rem', background: item.bg, color: item.color, border: `1px solid ${item.bg}`, borderRadius: '4px', fontWeight: 600 }}>
              {item.label}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}
