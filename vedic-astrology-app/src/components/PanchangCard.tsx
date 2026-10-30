'use client';

interface PanchangData {
  tithi: number;
  nakshatra: number;
  yoga: number;
  karana: number;
  vaar: string;
}

interface PanchangCardProps {
  panchang: PanchangData;
}

// Data mappings based on traditional Vedic Astrology
const TITHI_NAMES = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", 
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima", "Pratipada (K)", "Dwitiya (K)", "Tritiya (K)", 
  "Chaturthi (K)", "Panchami (K)", "Shashthi (K)", "Saptami (K)", "Ashtami (K)", "Navami (K)", "Dashami (K)", 
  "Ekadashi (K)", "Dwadashi (K)", "Trayodashi (K)", "Chaturdashi (K)", "Amavasya"
];

const NAKSHATRA_NAMES = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", 
  "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", 
  "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const YOGA_NAMES = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda", 
  "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva", 
  "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
];

const KARANA_NAMES = [
  "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti (Bhadra)", "Shakuni", "Chatushpada", "Naga", "Kinstughna"
];

export default function PanchangCard({ panchang }: PanchangCardProps) {
  if (!panchang) return null;

  const getKaranaName = (idx: number) => {
    // There are 60 karanas in a lunar month, repeating the 7 moving ones + 4 fixed. Approximation for UI.
    return KARANA_NAMES[(idx - 1) % KARANA_NAMES.length];
  };

  const getTithiName = (idx: number) => TITHI_NAMES[(idx - 1) % 30] || "Unknown";
  const getNakName = (idx: number) => NAKSHATRA_NAMES[(idx - 1) % 27] || "Unknown";
  const getYogaName = (idx: number) => YOGA_NAMES[(idx - 1) % 27] || "Unknown";

  const rows = [
    { label: "Vaar (Day)", value: panchang.vaar },
    { label: "Tithi", value: getTithiName(panchang.tithi) },
    { label: "Nakshatra", value: getNakName(panchang.nakshatra) },
    { label: "Yoga", value: getYogaName(panchang.yoga) },
    { label: "Karana", value: getKaranaName(panchang.karana) }
  ];

  return (
    <div className="card fade-in-up">
      <div className="card-header">
        <h2 className="card-title">Daily Panchang</h2>
        <p className="card-subtitle">The 5 Limbs of Time at Birth</p>
      </div>
      
      <div className="card-content" style={{ padding: '0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label} style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--foreground-muted)', width: '40%' }}>
                  {row.label}
                </td>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--foreground)' }}>
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
