'use client';

/**
 * North Indian Kundali Chart (Lagna Kundali)
 * 
 * GEOMETRY:
 * A 300×300 square with these lines:
 *   1. Outer square border
 *   2. Diagonal X from corner to corner: (0,0)→(300,300) and (300,0)→(0,300)
 *   3. Diamond connecting midpoints of sides: (150,0)→(300,150)→(150,300)→(0,150)→(150,0)
 * 
 * The X and diamond intersect at 4 points: (75,75), (225,75), (225,225), (75,225)
 * creating exactly 12 bounded regions:
 *   - 4 kite-shaped inner houses (top, left, bottom, right of center)
 *   - 8 corner triangles (2 per corner of the outer square)
 * 
 * HOUSE NUMBERING (counter-clockwise from top center):
 *   1=top kite, 2=top-left △, 3=left-upper △, 4=left kite,
 *   5=left-lower △, 6=bottom-left △, 7=bottom kite, 8=bottom-right △,
 *   9=right-lower △, 10=right kite, 11=right-upper △, 12=top-right △
 */

interface Planet {
  name: string;
  sign: string;
  degree: number;
  house: number;
  isRetrograde: boolean;
  nakshatra: string;
}

interface KundaliChartProps {
  planets: Record<string, Planet>;
  ascendantSign: string;
  size?: number;
}

const PLANET_ABBR: Record<string, string> = {
  Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me',
  Jupiter: 'Ju', Venus: 'Ve', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke',
};

const PLANET_COLORS: Record<string, string> = {
  Sun: '#f59e0b', Moon: '#e2e8f0', Mars: '#ef4444', Mercury: '#22c55e',
  Jupiter: '#eab308', Venus: '#ec4899', Saturn: '#6366f1', Rahu: '#64748b', Ketu: '#a78bfa',
};

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// 12 house polygons + text center positions
// Key geometry points:
//   Square corners: (0,0) (300,0) (300,300) (0,300)
//   Midpoints:      (150,0) top, (300,150) right, (150,300) bottom, (0,150) left
//   Center:         (150,150)
//   X-Diamond intersections: (75,75) (225,75) (225,225) (75,225)
const HOUSES: { points: string; cx: number; cy: number }[] = [
  // House 1  — Top center kite
  { points: '150,0 225,75 150,150 75,75',       cx: 150, cy: 65 },
  // House 2  — Top-left triangle (corner of outer square)
  { points: '0,0 150,0 75,75',                   cx: 75,  cy: 22 },
  // House 3  — Left-upper triangle
  { points: '0,0 75,75 0,150',                   cx: 22,  cy: 75 },
  // House 4  — Left center kite
  { points: '0,150 75,75 150,150 75,225',         cx: 65,  cy: 150 },
  // House 5  — Left-lower triangle
  { points: '0,150 75,225 0,300',                 cx: 22,  cy: 225 },
  // House 6  — Bottom-left triangle
  { points: '0,300 75,225 150,300',               cx: 75,  cy: 278 },
  // House 7  — Bottom center kite
  { points: '150,300 75,225 150,150 225,225',     cx: 150, cy: 235 },
  // House 8  — Bottom-right triangle
  { points: '150,300 225,225 300,300',             cx: 225, cy: 278 },
  // House 9  — Right-lower triangle
  { points: '300,300 225,225 300,150',             cx: 278, cy: 225 },
  // House 10 — Right center kite
  { points: '300,150 225,225 150,150 225,75',     cx: 235, cy: 150 },
  // House 11 — Right-upper triangle
  { points: '300,0 300,150 225,75',               cx: 278, cy: 75 },
  // House 12 — Top-right triangle
  { points: '150,0 225,75 300,0',                 cx: 225, cy: 22 },
];

export default function KundaliChart({ planets, ascendantSign, size = 340 }: KundaliChartProps) {
  // Group planets by house number (1-12)
  const houseMap: Record<number, Planet[]> = {};
  for (let i = 1; i <= 12; i++) houseMap[i] = [];
  Object.values(planets).forEach(p => {
    if (houseMap[p.house]) houseMap[p.house].push(p);
  });

  // Calculate zodiac sign number for each house
  const ascIdx = ZODIAC_SIGNS.indexOf(ascendantSign);
  const getSignNum = (houseNum: number) => ((ascIdx + houseNum - 1) % 12) + 1;

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      <svg
        width={size}
        height={size}
        viewBox="-2 -2 304 304"
        style={{ filter: 'drop-shadow(0 0 24px rgba(212, 175, 55, 0.1))' }}
      >
        <defs>
          <linearGradient id="goldLine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d4af37" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#f5d76e" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#d4af37" stopOpacity="0.85" />
          </linearGradient>
          <filter id="planetGlow">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Dark background fill */}
        <rect x="0" y="0" width="300" height="300" fill="rgba(6, 10, 20, 0.6)" />

        {/* Subtle highlight for House 1 (Lagna) */}
        <polygon points={HOUSES[0].points} fill="rgba(212, 175, 55, 0.07)" />

        {/* ===== STRUCTURAL LINES ===== */}

        {/* 1. Outer square */}
        <rect x="0" y="0" width="300" height="300" fill="none" stroke="url(#goldLine)" strokeWidth="1.8" />

        {/* 2. Corner-to-corner X diagonals */}
        <line x1="0" y1="0" x2="300" y2="300" stroke="url(#goldLine)" strokeWidth="1" opacity="0.6" />
        <line x1="300" y1="0" x2="0" y2="300" stroke="url(#goldLine)" strokeWidth="1" opacity="0.6" />

        {/* 3. Diamond connecting midpoints of sides */}
        <polygon
          points="150,0 300,150 150,300 0,150"
          fill="none"
          stroke="url(#goldLine)"
          strokeWidth="1"
          opacity="0.6"
        />

        {/* ===== SIGN NUMBERS (small, in red, like traditional charts) ===== */}
        {HOUSES.map((house, idx) => {
          const signNum = getSignNum(idx + 1);
          // Position the sign number in a corner of the house (offset from center)
          // For kite houses (0,3,6,9): place sign number near the outer tip
          // For triangle houses: place near the outer corner
          const isKite = idx === 0 || idx === 3 || idx === 6 || idx === 9;
          let sx = house.cx;
          let sy = house.cy;

          if (isKite) {
            // Push sign number toward outer edge
            if (idx === 0) { sx = 120; sy = 32; }
            if (idx === 3) { sx = 32; sy = 120; }
            if (idx === 6) { sx = 120; sy = 268; }
            if (idx === 9) { sx = 268; sy = 120; }
          } else {
            // For triangles, offset slightly toward the outer corner
            if (idx === 1)  { sx = 40; sy = 14; }
            if (idx === 2)  { sx = 14; sy = 40; }
            if (idx === 4)  { sx = 14; sy = 260; }
            if (idx === 5)  { sx = 40; sy = 288; }
            if (idx === 7)  { sx = 260; sy = 288; }
            if (idx === 8)  { sx = 288; sy = 260; }
            if (idx === 10) { sx = 288; sy = 40; }
            if (idx === 11) { sx = 260; sy = 14; }
          }

          return (
            <text
              key={`sign-${idx}`}
              x={sx}
              y={sy}
              fill="#e74c3c"
              fontSize="10"
              fontFamily="Outfit, sans-serif"
              fontWeight="600"
              textAnchor="middle"
              dominantBaseline="middle"
              opacity="0.7"
            >
              {String(signNum).padStart(2, '0')}
            </text>
          );
        })}

        {/* ===== PLANETS ===== */}
        {HOUSES.map((house, idx) => {
          const planetsInHouse = houseMap[idx + 1] || [];
          if (planetsInHouse.length === 0) return null;

          const count = planetsInHouse.length;
          // Stack planets vertically, centered on the house center
          const lineHeight = 12;
          const totalHeight = (count - 1) * lineHeight;
          const startY = house.cy - totalHeight / 2;

          return planetsInHouse.map((planet, pIdx) => {
            const abbr = PLANET_ABBR[planet.name] || planet.name.slice(0, 2);
            const color = PLANET_COLORS[planet.name] || '#e2e8f0';
            const y = startY + pIdx * lineHeight;

            return (
              <text
                key={planet.name}
                x={house.cx}
                y={y}
                fill={color}
                fontSize="11"
                fontFamily="Outfit, sans-serif"
                fontWeight="700"
                textAnchor="middle"
                dominantBaseline="middle"
                filter="url(#planetGlow)"
              >
                {abbr}{planet.isRetrograde ? 'ᴿ' : ''}
              </text>
            );
          });
        })}

        {/* "Asc" label in House 1 */}
        <text
          x={150}
          y={12}
          fill="rgba(212,175,55,0.5)"
          fontSize="7"
          fontFamily="Outfit, sans-serif"
          fontWeight="300"
          textAnchor="middle"
          letterSpacing="1"
        >
          ASC
        </text>
      </svg>

      {/* Ascendant info below chart */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Lagna / Ascendant
        </div>
        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary-gold)' }}>
          {ascendantSign}
        </div>
      </div>
    </div>
  );
}
