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

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// 12 house polygons + text center positions
const HOUSES: { points: string; cx: number; cy: number; sx: number; sy: number }[] = [
  // 1: Top Kite
  { points: '150,0 225,75 150,150 75,75',       cx: 150, cy: 75,  sx: 150, sy: 15 },
  // 2: Top-Left Triangle
  { points: '0,0 150,0 75,75',                   cx: 75,  cy: 30,  sx: 75,  sy: 10 },
  // 3: Left-Upper Triangle
  { points: '0,0 75,75 0,150',                   cx: 30,  cy: 75,  sx: 10,  sy: 75 },
  // 4: Left Kite
  { points: '0,150 75,75 150,150 75,225',         cx: 75,  cy: 150, sx: 15,  sy: 150 },
  // 5: Left-Lower Triangle
  { points: '0,150 75,225 0,300',                 cx: 30,  cy: 225, sx: 10,  sy: 225 },
  // 6: Bottom-Left Triangle
  { points: '0,300 75,225 150,300',               cx: 75,  cy: 270, sx: 75,  sy: 290 },
  // 7: Bottom Kite
  { points: '150,300 75,225 150,150 225,225',     cx: 150, cy: 225, sx: 150, sy: 285 },
  // 8: Bottom-Right Triangle
  { points: '150,300 225,225 300,300',             cx: 225, cy: 270, sx: 225, sy: 290 },
  // 9: Right-Lower Triangle
  { points: '300,300 225,225 300,150',             cx: 270, cy: 225, sx: 290, sy: 225 },
  // 10: Right Kite
  { points: '300,150 225,225 150,150 225,75',     cx: 225, cy: 150, sx: 285, sy: 150 },
  // 11: Right-Upper Triangle
  { points: '300,0 300,150 225,75',               cx: 270, cy: 75,  sx: 290, sy: 75 },
  // 12: Top-Right Triangle
  { points: '150,0 225,75 300,0',                 cx: 225, cy: 30,  sx: 225, sy: 10 },
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
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <svg
        width={size}
        height={size}
        viewBox="-2 -2 304 304"
      >
        {/* White background */}
        <rect x="0" y="0" width="300" height="300" fill="#ffffff" />

        {/* Subtle highlight for House 1 (Lagna) */}
        <polygon points={HOUSES[0].points} fill="rgba(230, 184, 0, 0.06)" />

        {/* ===== STRUCTURAL LINES ===== */}

        {/* 1. Outer square */}
        <rect x="0" y="0" width="300" height="300" fill="none" stroke="#c49b00" strokeWidth="2" />

        {/* 2. Corner-to-corner X diagonals */}
        <line x1="0" y1="0" x2="300" y2="300" stroke="#e6b800" strokeWidth="1.2" />
        <line x1="300" y1="0" x2="0" y2="300" stroke="#e6b800" strokeWidth="1.2" />

        {/* 3. Diamond connecting midpoints of sides */}
        <polygon
          points="150,0 300,150 150,300 0,150"
          fill="none"
          stroke="#e6b800"
          strokeWidth="1.2"
        />

        {/* ===== SIGN NUMBERS (red, traditional) ===== */}
        {HOUSES.map((house, idx) => {
          const signNum = getSignNum(idx + 1);
          
          return (
            <text
              key={`sign-${idx}`}
              x={house.sx}
              y={house.sy}
              fill="#cc0000"
              fontSize="10"
              fontFamily="Outfit, sans-serif"
              fontWeight="600"
              textAnchor="middle"
              dominantBaseline="middle"
              opacity="0.8"
            >
              {String(signNum).padStart(2, '0')}
            </text>
          );
        })}

        {/* ===== PLANETS WITH DEGREES ===== */}
        {HOUSES.map((house, idx) => {
          const planetsInHouse = houseMap[idx + 1] || [];
          if (planetsInHouse.length === 0) return null;

          const count = planetsInHouse.length;
          const lineHeight = 13;
          const totalHeight = (count - 1) * lineHeight;
          const startY = house.cy - totalHeight / 2;

          return planetsInHouse.map((planet, pIdx) => {
            const abbr = PLANET_ABBR[planet.name] || planet.name.slice(0, 2);
            const deg = Math.floor(planet.degree);
            const y = startY + pIdx * lineHeight;
            const label = `${abbr}${planet.isRetrograde ? 'ᴿ' : ''} ${deg}°`;

            return (
              <text
                key={planet.name}
                x={house.cx}
                y={y}
                fill="#1a1a2e"
                fontSize="10"
                fontFamily="Outfit, sans-serif"
                fontWeight="600"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {label}
              </text>
            );
          });
        })}

        {/* "Asc" label in House 1 */}
        <text
          x={150}
          y={135}
          fill="#c49b00"
          fontSize="7"
          fontFamily="Outfit, sans-serif"
          fontWeight="400"
          textAnchor="middle"
          letterSpacing="1"
        >
          ASC
        </text>
      </svg>

      {/* Ascendant info below chart */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Lagna / Ascendant
        </div>
        <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--primary-saffron)' }}>
          {ascendantSign}
        </div>
      </div>
    </div>
  );
}
