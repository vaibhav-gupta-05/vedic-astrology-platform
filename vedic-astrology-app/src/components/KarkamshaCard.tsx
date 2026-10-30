'use client';

const KARAKA_ABBR_COLORS: Record<string, string> = {
  AK: '#e07b39', AmK: '#c49b00', BK: '#16a34a', MK: '#4a90a4',
  PK: '#6c3ec2', GK: '#dc2626', DK: '#d946a8',
};

const PLANET_ICONS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿',
  Jupiter: '♃', Venus: '♀', Saturn: '♄',
};

interface Karaka {
  rank: number;
  karaka: string;
  abbreviation: string;
  planet: string;
  degree: number;
  sign: string;
}

interface KarkamshaData {
  atmakaraka_planet: string;
  karkamsha_sign: string;
  karakas: Karaka[];
}

interface Props {
  karkamsha: KarkamshaData;
}

export default function KarkamshaCard({ karkamsha }: Props) {
  if (!karkamsha) return null;
  const { atmakaraka_planet, karkamsha_sign, karakas } = karkamsha;

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Karkamsha Lagna Highlight */}
      <div className="glass-panel-static" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(224,123,57,0.05), rgba(230,184,0,0.05))' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              Atmakaraka (Soul Planet)
            </p>
            <h2 style={{ margin: '0.3rem 0 0', fontSize: '1.6rem', fontWeight: 700, color: 'var(--primary-saffron)' }}>
              {PLANET_ICONS[atmakaraka_planet]} {atmakaraka_planet}
            </h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              Karkamsha Lagna (Navamsha)
            </p>
            <h2 style={{ margin: '0.3rem 0 0', fontSize: '1.6rem', fontWeight: 700, color: '#6c3ec2' }}>
              {karkamsha_sign}
            </h2>
          </div>
        </div>
        <p style={{ margin: '1rem 0 0', fontSize: '0.84rem', color: 'var(--foreground-muted)', lineHeight: 1.6 }}>
          The <strong>{atmakaraka_planet}</strong> is the Atmakaraka — the planet with the highest degree in its sign, 
          representing the core soul desire. Its Navamsha placement in <strong>{karkamsha_sign}</strong> defines the 
          Karkamsha Lagna for deep karmic and spiritual analysis.
        </p>
      </div>

      {/* Chara Karaka Table */}
      <div className="glass-panel-static" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
            Jaimini Chara Karakas
          </h3>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>
            7-planet scheme — ranked by descending degree within sign
          </p>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
              <th style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-color)', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem' }}>Role</th>
              <th style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-color)', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem' }}>Planet</th>
              <th style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-color)', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem' }}>Sign</th>
              <th style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-color)', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem' }}>Degree</th>
            </tr>
          </thead>
          <tbody>
            {karakas.map((k, i) => {
              const color = KARAKA_ABBR_COLORS[k.abbreviation] || '#64647a';
              return (
                <tr key={k.abbreviation} style={{ borderBottom: i < karakas.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                  <td style={{ padding: '0.9rem 1.5rem' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                      padding: '0.2rem 0.6rem', background: `${color}15`,
                      border: `1px solid ${color}30`, borderRadius: '6px',
                      fontSize: '0.82rem', fontWeight: 700, color
                    }}>
                      {k.abbreviation}
                    </span>
                    <span style={{ marginLeft: '0.6rem', fontSize: '0.82rem', color: 'var(--foreground-muted)' }}>
                      {k.karaka}
                    </span>
                  </td>
                  <td style={{ padding: '0.9rem 1.5rem', fontWeight: 600, fontSize: '0.95rem' }}>
                    <span style={{ marginRight: '0.3rem' }}>{PLANET_ICONS[k.planet]}</span>
                    {k.planet}
                  </td>
                  <td style={{ padding: '0.9rem 1.5rem', color: 'var(--foreground-muted)' }}>
                    {k.sign}
                  </td>
                  <td style={{ padding: '0.9rem 1.5rem', color: 'var(--foreground-muted)', fontFamily: 'monospace' }}>
                    {k.degree.toFixed(2)}°
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
